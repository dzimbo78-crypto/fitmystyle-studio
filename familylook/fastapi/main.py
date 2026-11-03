"""Optional private FamilyLook backend. Local 3D works with this service disabled."""
import asyncio
import hashlib
import hmac
import json
import os
import re
import time
from collections import deque
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, HTTPException, Header, Request, Response
from pydantic import BaseModel, Field
from pdf_pack import make_pdf, Pack

app = FastAPI(title='FamilyLook Atelier API', version='3.0.0')
_cache = {}
_started = deque()
_ai_lock = asyncio.Lock()

def ai_enabled():
    return (os.getenv('FAMILYLOOK_AI_ENABLED') == 'true' and bool(os.getenv('BFL_API_KEY'))
            and len(os.getenv('FAMILYLOOK_BACKEND_TOKEN', '')) >= 32)

def authorize(authorization):
    token = os.getenv('FAMILYLOOK_BACKEND_TOKEN', '')
    if len(token) < 32:
        raise HTTPException(503, 'Prywatny backend nie jest podłączony.')
    if not authorization or not hmac.compare_digest(authorization, 'Bearer ' + token):
        raise HTTPException(401, 'Nieprawidłowa autoryzacja serwera.')

@app.middleware('http')
async def bounded_request(request: Request, call_next):
    if int(request.headers.get('content-length', '0') or '0') > 450000:
        return Response('Request too large', status_code=413)
    if request.method == 'POST':
        body = await request.body()
        if len(body) > 450000:
            return Response('Request too large', status_code=413)
    result = await call_next(request)
    result.headers['Cache-Control'] = 'no-store'
    return result

class Preview(BaseModel):
    people: int = Field(ge=1, le=12)
    outfit_description: str = Field(min_length=5, max_length=1400)
    palette: str = Field(max_length=100)

@app.get('/health')
def health():
    return {'status': 'ok', 'ai_enabled': ai_enabled(), 'local_preview': '3D', 'dispatch_enabled': False}

def validate_poll_url(url):
    p = urlparse(url)
    if p.scheme != 'https' or not re.fullmatch(r'api(?:\.[a-z0-9-]+)?\.bfl\.ai', p.hostname or '') or p.path != '/v1/get_result' or p.username or p.port not in (None,443):
        raise HTTPException(502, 'Nieprawidłowy adres wyniku dostawcy.')
    return url

async def render_bfl(req):
    prompt = (f'Photorealistic Scandinavian fashion studio editorial of exactly {req.people} family members. '
              f'Outfits: {req.outfit_description}. Coordinated palette: {req.palette}. '
              'Full bodies, believable age-appropriate anatomy and fabric drape, broad soft studio lighting, '
              'warm off-white cyclorama. Baby comfortably seated safely near adult. Blank garments, '
              'no brand logos, no lettering, no watermarks. This is collection inspiration, not a body-size prediction.')
    async with httpx.AsyncClient(timeout=httpx.Timeout(12), follow_redirects=False) as client:
        response = await client.post('https://api.bfl.ai/v1/flux-2-pro', headers={'x-key': os.environ['BFL_API_KEY']},
                                     json={'prompt': prompt, 'width': 1536, 'height': 1024, 'output_format': 'jpeg', 'safety_tolerance': 2})
        if response.status_code == 429:
            raise HTTPException(429, 'Limit dostawcy AI. Korzystaj z lokalnego podglądu 3D.')
        if not response.is_success:
            raise HTTPException(503, 'Generator niedostępny. Podgląd 3D nadal działa.')
        polling_url = validate_poll_url(response.json().get('polling_url', ''))
        for _ in range(20):
            await asyncio.sleep(2)
            result = await client.get(polling_url, headers={'x-key': os.environ['BFL_API_KEY']})
            if not result.is_success:
                raise HTTPException(503, 'Wynik AI jest niedostępny.')
            data = result.json()
            if data.get('status') == 'Ready':
                url = (data.get('result') or {}).get('sample')
                if not isinstance(url,str) or not url.startswith('https://'):
                    raise HTTPException(502, 'Nieprawidłowy obraz wyniku.')
                return {'image_url': url, 'status': 'AI_INSPIRATION', 'fallback': 'LOCAL_3D'}
            if data.get('status') in ['Error', 'Request Moderated', 'Content Moderated', 'Task not found', 'No Card Generated']:
                raise HTTPException(503, 'Nie udało się wygenerować inspiracji.')
        raise HTTPException(504, 'Wynik nie jest jeszcze gotowy. Nie ponawiaj automatycznie generowania.')

@app.post('/api/visualize')
async def visualize(req: Preview, authorization: str | None = Header(default=None)):
    if not ai_enabled():
        raise HTTPException(503, 'AI nie jest podłączone. Użyj gotowych manekinów 3D.')
    authorize(authorization)
    now = time.monotonic()
    key = hashlib.sha256(req.model_dump_json().encode()).hexdigest()
    if key in _cache and _cache[key][0] > now:
        return _cache[key][1]
    if _ai_lock.locked():
        raise HTTPException(429, 'Trwa generowanie. Spróbuj później, podgląd 3D działa.')
    async with _ai_lock:
        while _started and _started[0] < now-3600:
            _started.popleft()
        limit = max(0, min(100, int(os.getenv('FAMILYLOOK_AI_HOURLY_LIMIT', '6'))))
        if len(_started) >= limit:
            raise HTTPException(429, 'Osiągnięto limit generowania.')
        _started.append(now)
        try:
            result = await render_bfl(req)
            if len(_cache) > 100:
                _cache.clear()
            _cache[key] = (now+300, result)
            return result
        except (httpx.HTTPError, ValueError, KeyError):
            raise HTTPException(503, 'Usługa AI niedostępna. Użyj lokalnego podglądu 3D.') from None

@app.post('/v1/tech-pack.pdf')
def tech_pack(req: Pack, authorization: str | None = Header(default=None)):
    authorize(authorization)
    return Response(make_pdf(req), media_type='application/pdf', headers={'Content-Disposition': 'attachment; filename="familylook-techpack.pdf"'})

from fastapi.testclient import TestClient
from main import app
client=TestClient(app)
base={'name':'Sample','people':[{'id':'1','label':'Mama','group':'adult','model':'crewneck','size':'S','measurements':{'chest':96,'height':168}}]}
def test_health(): assert client.get('/health').json()['production_dispatch'] is False
def test_pdf_download():
    r=client.post('/v1/tech-pack.pdf',json=base)
    assert r.status_code==200
    assert r.headers['content-type']=='application/pdf'
    assert r.content.startswith(b'%PDF')
    assert len(r.content)>5000
def test_invalid_body_group():
    bad={'people':[{'id':'1','label':'Baby','group':'infant','model':'hoodie','measurements':{}}]}
    assert client.post('/v1/tech-pack.pdf',json=bad).status_code==422
def test_draft_does_not_dispatch():
    r=client.post('/v1/manufacturer/draft',json=base)
    assert r.status_code==200 and r.json()['order_created'] is False
    assert r.json()['items'][0]['provider_variant_id'] is None
def test_ai_503():
    assert client.post('/v1/ai/visualization',json={'project':base}).status_code==503
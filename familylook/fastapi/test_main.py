import pytest
from fastapi.testclient import TestClient
import main
from main import app,validate_poll_url
from pdf_pack import Pack
client=TestClient(app)
TOKEN='familylook-test-token-0123456789abcdef'
BASE={'people':4,'outfit_description':'Rodzina w kremowych bluzach','palette':'sage'}
def test_health(monkeypatch):
    monkeypatch.delenv('FAMILYLOOK_AI_ENABLED',raising=False)
    assert client.get('/health').json()['ai_enabled'] is False
def test_safe_fallback(monkeypatch):
    monkeypatch.delenv('FAMILYLOOK_AI_ENABLED',raising=False)
    assert client.post('/api/visualize',json=BASE).status_code==503
def test_ai_cannot_run_without_server_authorization(monkeypatch):
    for k,v in [('FAMILYLOOK_AI_ENABLED','true'),('BFL_API_KEY','mock-provider-key'),('FAMILYLOOK_BACKEND_TOKEN',TOKEN)]:monkeypatch.setenv(k,v)
    assert client.post('/api/visualize',json=BASE).status_code==401
def test_result_polling_rejects_external_or_internal_hosts():
    for url in ['http://api.bfl.ai/v1/get_result?id=x','https://localhost/v1/get_result?id=x','https://api.bfl.ai.evil.example/v1/get_result','https://api.bfl.ai/other','https://u:p@api.bfl.ai/v1/get_result','https://api.bfl.ai:8443/v1/get_result']:
        with pytest.raises(Exception):validate_poll_url(url)
    assert validate_poll_url('https://api.eu2.bfl.ai/v1/get_result?id=known')
def test_repeat_configuration_reuses_result_and_quota_blocks_new_cost(monkeypatch):
    for k,v in [('FAMILYLOOK_AI_ENABLED','true'),('BFL_API_KEY','mock-provider-key'),('FAMILYLOOK_BACKEND_TOKEN',TOKEN),('FAMILYLOOK_AI_HOURLY_LIMIT','1')]:monkeypatch.setenv(k,v)
    main._cache.clear();main._started.clear();calls=[]
    async def fake(req):
        calls.append(req)
        return {'image_url':'https://example.com/mock.jpg','status':'AI_INSPIRATION'}
    monkeypatch.setattr(main,'render_bfl',fake)
    headers={'Authorization':'Bearer '+TOKEN}
    assert client.post('/api/visualize',json=BASE,headers=headers).status_code==200
    assert client.post('/api/visualize',json=BASE,headers=headers).status_code==200
    assert len(calls)==1
    assert client.post('/api/visualize',json={**BASE,'palette':'espresso'},headers=headers).status_code==429
    main._cache.clear();main._started.clear()
def pack_payload():
    return {'title':'Rodzina','members':[{'id':'a','name':'Mama','group':'adult','shape':'female','templateId':'T04','fit':'regular','measurements':{'height':168,'chest':92}},{'id':'b','name':'Dziecko','group':'child','templateId':'T01','measurements':{}}]}
def test_pdf_requires_private_server_token_and_contains_pdf(monkeypatch):
    monkeypatch.setenv('FAMILYLOOK_BACKEND_TOKEN',TOKEN)
    assert client.post('/v1/tech-pack.pdf',json=pack_payload()).status_code==401
    res=client.post('/v1/tech-pack.pdf',json=pack_payload(),headers={'Authorization':'Bearer '+TOKEN})
    assert res.status_code==200
    assert res.headers['content-type']=='application/pdf'
    assert res.content.startswith(b'%PDF-')
    assert b'/Count 2' in res.content
def test_pdf_validation_rejects_age_incompatible_model_and_nonfinite_measurements():
    p=pack_payload();p['members'][1]['templateId']='T14'
    with pytest.raises(Exception):Pack(**p)
    p=pack_payload();p['members'][0]['measurements']['chest']=float('nan')
    with pytest.raises(Exception):Pack(**p)
def test_api_enforces_request_size():
    assert client.post('/api/visualize',content='x'*450001,headers={'Content-Type':'application/json'}).status_code==413

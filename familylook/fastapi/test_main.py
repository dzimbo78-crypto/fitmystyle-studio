from fastapi.testclient import TestClient
from main import app
client=TestClient(app)
def test_health():assert client.get('/health').json()['ai_enabled'] is False
def test_safe_fallback():assert client.post('/api/visualize',json={'people':4,'outfit_description':'Rodzina w kremowych bluzach','palette':'sage'}).status_code==503
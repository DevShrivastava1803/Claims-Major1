from fastapi.testclient import TestClient
import sys
sys.path.append('Backend')
import main

client = TestClient(main.app)

def run():
    r = client.get('/api/health')
    print('HEALTH:', r.status_code, r.json())

    q = client.get('/api/query', params={'query':'What is the waiting period for cataract surgery?'})
    print('QUERY:', q.status_code, q.json())

if __name__ == '__main__':
    run()
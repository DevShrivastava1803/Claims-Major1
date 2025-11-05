import sys
sys.path.append('Backend')
import main
from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas
import os

def make_pdf(path: str):
    c = canvas.Canvas(path)
    c.drawString(100, 750, "Insurance Policy: Cataract Surgery Waiting Period is 12 months.")
    c.showPage()
    c.save()

def run():
    client = TestClient(main.app)
    tmp_path = os.path.join('Backend', 'tests', 'temp_upload.pdf')
    make_pdf(tmp_path)
    with open(tmp_path, 'rb') as f:
        files = {'file': ('policy.pdf', f, 'application/pdf')}
        r = client.post('/api/process-pdf', files=files)
        print('UPLOAD STATUS:', r.status_code)
        try:
            print('UPLOAD BODY:', r.json())
        except Exception:
            print('UPLOAD RAW:', r.text)

if __name__ == '__main__':
    run()
import sys
from pathlib import Path

# Add backend folder to Python path so pytest can find main.py
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_and_share_document():
    create_response = client.post(
        "/documents",
        json={
            "title": "Test Sharing Document",
            "content_html": "<p>Hello from automated test</p>",
            "owner_id": 1,
        },
    )

    assert create_response.status_code == 200

    document = create_response.json()
    document_id = document["id"]

    share_response = client.post(
        f"/documents/{document_id}/share",
        json={
            "owner_id": 1,
            "shared_with_user_id": 2,
        },
    )

    assert share_response.status_code == 200

    ben_documents_response = client.get(
        "/documents",
        params={"user_id": 2},
    )

    assert ben_documents_response.status_code == 200

    ben_documents = ben_documents_response.json()
    shared_titles = [doc["title"] for doc in ben_documents["shared"]]

    assert "Test Sharing Document" in shared_titles
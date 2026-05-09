from datetime import datetime
import html

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db, SessionLocal
import models
import schemas


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ajaia DocLite API")


# Allow React frontend to call FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Change these names if you want different demo users.
SEED_USERS = [
    {"name": "Alice", "email": "alice@ajaia.local"},
    {"name": "Ben", "email": "ben@ajaia.local"},
    {"name": "Priya", "email": "priya@ajaia.local"},
]


def seed_users():
    db = SessionLocal()
    try:
        existing_users = db.query(models.User).count()

        if existing_users == 0:
            users = [
                models.User(name=user["name"], email=user["email"])
                for user in SEED_USERS
            ]

            db.add_all(users)
            db.commit()
    finally:
        db.close()


seed_users()


def get_user_or_404(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def get_document_or_404(db: Session, document_id: int):
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document


def user_can_access_document(
    db: Session,
    document: models.Document,
    user_id: int
) -> bool:
    if document.owner_id == user_id:
        return True

    shared_record = (
        db.query(models.DocumentShare)
        .filter(
            models.DocumentShare.document_id == document.id,
            models.DocumentShare.shared_with_user_id == user_id,
        )
        .first()
    )

    return shared_record is not None


def serialize_document(document: models.Document, access_type: str):
    return {
        "id": document.id,
        "title": document.title,
        "content_html": document.content_html,
        "owner_id": document.owner_id,
        "owner_name": document.owner.name if document.owner else "",
        "access_type": access_type,
    }


@app.get("/")
def root():
    return {"message": "Ajaia DocLite backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


@app.post("/documents")
def create_document(
    document_data: schemas.DocumentCreate,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, document_data.owner_id)

    title = document_data.title.strip() if document_data.title else "Untitled Document"

    if not title:
        title = "Untitled Document"

    document = models.Document(
        title=title,
        content_html=document_data.content_html or "",
        owner_id=document_data.owner_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return serialize_document(document, access_type="owned")


@app.get("/documents")
def get_documents_for_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, user_id)

    owned_documents = (
        db.query(models.Document)
        .filter(models.Document.owner_id == user_id)
        .order_by(models.Document.updated_at.desc())
        .all()
    )

    shared_documents = (
        db.query(models.Document)
        .join(
            models.DocumentShare,
            models.Document.id == models.DocumentShare.document_id
        )
        .filter(models.DocumentShare.shared_with_user_id == user_id)
        .order_by(models.Document.updated_at.desc())
        .all()
    )

    return {
        "owned": [
            serialize_document(doc, access_type="owned")
            for doc in owned_documents
        ],
        "shared": [
            serialize_document(doc, access_type="shared")
            for doc in shared_documents
        ],
    }


# Important: this must come BEFORE /documents/{document_id}
@app.get("/documents/shared-by-me")
def get_documents_shared_by_me(
    user_id: int,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, user_id)

    shares = (
        db.query(models.DocumentShare)
        .join(
            models.Document,
            models.DocumentShare.document_id == models.Document.id
        )
        .filter(models.Document.owner_id == user_id)
        .all()
    )

    result = []

    for share in shares:
        result.append(
            {
                "document_id": share.document.id,
                "title": share.document.title,
                "shared_with_user_id": share.shared_with_user.id,
                "shared_with_name": share.shared_with_user.name,
                "shared_with_email": share.shared_with_user.email,
            }
        )

    return result


@app.get("/documents/{document_id}")
def get_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, user_id)
    document = get_document_or_404(db, document_id)

    if not user_can_access_document(db, document, user_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to this document"
        )

    access_type = "owned" if document.owner_id == user_id else "shared"

    return serialize_document(document, access_type=access_type)


@app.put("/documents/{document_id}")
def update_document(
    document_id: int,
    document_data: schemas.DocumentUpdate,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, document_data.user_id)
    document = get_document_or_404(db, document_id)

    if not user_can_access_document(db, document, document_data.user_id):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to update this document"
        )

    clean_title = document_data.title.strip()

    if not clean_title:
        raise HTTPException(
            status_code=400,
            detail="Document title cannot be empty"
        )

    # Owner can update both title and content.
    # Shared user can update content, but cannot rename the document.
    if document.owner_id == document_data.user_id:
        document.title = clean_title

    document.content_html = document_data.content_html or ""
    document.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(document)

    access_type = "owned" if document.owner_id == document_data.user_id else "shared"

    return serialize_document(document, access_type=access_type)


@app.patch("/documents/{document_id}/rename")
def rename_document(
    document_id: int,
    user_id: int,
    title: str,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, user_id)
    document = get_document_or_404(db, document_id)

    if document.owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the owner can rename this document"
        )

    clean_title = title.strip()

    if not clean_title:
        raise HTTPException(
            status_code=400,
            detail="Document title cannot be empty"
        )

    document.title = clean_title
    document.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(document)

    return serialize_document(document, access_type="owned")


@app.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    get_user_or_404(db, user_id)
    document = get_document_or_404(db, document_id)

    if document.owner_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the owner can delete this document"
        )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
    }


@app.post("/documents/upload")
async def upload_document(
    owner_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    get_user_or_404(db, owner_id)

    allowed_extensions = [".txt", ".md"]

    filename = file.filename or ""

    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .md files are supported"
        )

    raw_content = await file.read()

    try:
        text_content = raw_content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File must be valid UTF-8 text"
        )

    safe_text = html.escape(text_content)
    content_html = "<p>" + safe_text.replace("\n", "<br>") + "</p>"

    title = filename.rsplit(".", 1)[0] if "." in filename else filename

    document = models.Document(
        title=title or "Uploaded Document",
        content_html=content_html,
        owner_id=owner_id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return serialize_document(document, access_type="owned")


@app.post("/documents/{document_id}/share")
def share_document(
    document_id: int,
    share_data: schemas.ShareRequest,
    db: Session = Depends(get_db)
):
    owner = get_user_or_404(db, share_data.owner_id)
    shared_user = get_user_or_404(db, share_data.shared_with_user_id)
    document = get_document_or_404(db, document_id)

    if document.owner_id != owner.id:
        raise HTTPException(
            status_code=403,
            detail="Only the owner can share this document"
        )

    if owner.id == shared_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot share a document with yourself"
        )

    existing_share = (
        db.query(models.DocumentShare)
        .filter(
            models.DocumentShare.document_id == document_id,
            models.DocumentShare.shared_with_user_id == shared_user.id,
        )
        .first()
    )

    if existing_share:
        return {
            "message": "Document is already shared with this user",
            "document_id": document_id,
            "shared_with_user_id": shared_user.id,
        }

    share = models.DocumentShare(
        document_id=document_id,
        shared_with_user_id=shared_user.id,
    )

    db.add(share)
    db.commit()

    return {
        "message": "Document shared successfully",
        "document_id": document_id,
        "shared_with_user_id": shared_user.id,
    }
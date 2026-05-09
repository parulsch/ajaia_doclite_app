from pydantic import BaseModel
from typing import Optional


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class DocumentCreate(BaseModel):
    title: Optional[str] = "Untitled Document"
    content_html: Optional[str] = ""
    owner_id: int


class DocumentUpdate(BaseModel):
    title: str
    content_html: Optional[str] = ""
    user_id: int


class ShareRequest(BaseModel):
    owner_id: int
    shared_with_user_id: int


class DocumentOut(BaseModel):
    id: int
    title: str
    content_html: Optional[str]
    owner_id: int
    owner_name: str
    access_type: str

    class Config:
        from_attributes = True
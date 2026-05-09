# \# Ajaia DocLite

# 

# Ajaia DocLite is a lightweight collaborative document editor built for the Ajaia full-stack product-engineering assignment.

# 

# The goal was not to recreate Google Docs completely. The goal was to ship a focused working product slice that demonstrates document creation, editing, upload, sharing, persistence, and clear product tradeoffs.

# 

# \## Live Links

# 

# Frontend:

# TODO: ajaia-doclite-app.vercel.app

# 

# Backend API:

# TODO: https://ajaia-doclite-app.onrender.com

# 

# Walkthrough Video:

# TODO: paste Loom/YouTube/Drive video URL:  https://drive.google.com/drive/folders/1s-7IGDOEfTwh1ylTYnXJeAwuWNgq3PKX?usp=drive_link

# 

# \## Core Features

# 

# \- Homepage with seeded user selection

# \- Create a new document

# \- Open existing documents

# \- Rename documents

# \- Delete owned documents

# \- Edit document content in browser

# \- Save and reopen documents

# \- Basic rich-text formatting:

# &#x20; - Bold

# &#x20; - Italic

# &#x20; - Underline

# &#x20; - Headings

# &#x20; - Bulleted lists

# &#x20; - Numbered lists

# \- Upload .txt or .md files and convert them into editable documents

# \- Share a document with another user

# \- View documents in three sections:

# &#x20; - My Documents

# &#x20; - Shared By Me

# &#x20; - Shared With Me

# \- SQLite persistence

# \- Basic backend validation and error handling

# \- One automated backend test for document sharing

# 

# \## Seeded Demo Users

# 

# The app uses seeded demo users instead of full authentication.

# 

# Example users:

# 

# \- Anthony

# \- Bubbles

# \- Cecilea

# 

# If custom names are configured in the database, the homepage dynamically displays those users.

# 

# \## Supported Upload Types

# 

# This MVP supports:

# 

# \- .txt

# \- .md

# 

# Unsupported files are rejected with a validation message.

# 

# \## Local Setup

# 

# \### Backend

# 

# From the project root:

# 

# ```bash

# cd backend

# python -m venv .venv

# .venv\\Scripts\\activate

# pip install -r requirements.txt

# uvicorn main:app --reload
Backend local:
http://127.0.0.1:8000

Backend Swagger docs local:
http://127.0.0.1:8000/docs

Frontend local:
http://localhost:5173

Backend runs at:

http://127.0.0.1:8000

Swagger API docs:

http://127.0.0.1:8000/docs
Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend runs at:

http://localhost:5173
Testing

Run backend tests:

cd backend
pytest

Expected result:

1 passed
Main Demo Flow
Open the frontend.
Select a user from the homepage.
Create a new document.
Rename it.
Add formatted content.
Save it.
Refresh and reopen it.
Upload a .txt or .md file.
Share a document with another user.
Switch users and confirm the document appears under Shared With Me.
Known Limitations
No real authentication
No real-time collaboration
No comments or suggestion mode
No document version history
SQLite is used for MVP persistence
Shared users can access documents, but advanced role-based permissions are not implemented
Future Improvements

With another 2-4 hours, I would add:

View/edit role-based sharing
Version history
Comments
Better file import support for .docx
Production authentication
More frontend tests


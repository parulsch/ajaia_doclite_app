# Submission

## Project Name

Ajaia DocLite

## Included Materials

This submission includes:

1. Source code
   - backend/
   - frontend/

2. Documentation
   - readme.md
   - architecture.md
   - ai_workflow.md
   - Submission.md

3. Demo materials
   - walkthrough_video.txt
   - screenshots/ folder, if included

4. Live links
   - Frontend URL: TODO
   - Backend API URL: TODO
   - Walkthrough video URL: TODO

## What Works

- Homepage user selection
- Create document
- Open document
- Rename document
- Delete owned document
- Edit document content in browser
- Save and reopen documents
- Basic rich-text formatting
  - Bold
  - Italic
  - Underline
  - Headings
  - Bulleted lists
  - Numbered lists
- Upload .txt and .md files
- Share documents with another user
- View My Documents
- View Shared By Me
- View Shared With Me
- SQLite persistence
- Backend validation and error handling
- One automated backend test

## Seeded Users

Demo users are seeded in the backend database.

Example users:

- Anthony
- Bubble
- Cecilea

If custom names are used, the homepage displays the current seeded users dynamically.

## Local Run Instructions

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Frontend:

cd frontend
npm install
npm run dev

Run tests:

cd backend
pytest
Incomplete or Deprioritized Features

The following features were intentionally left out:

Real-time collaboration
Full authentication
Version history
Comments
Suggestion mode
Advanced role-based permissions
.docx file parsing
What I Would Build Next

With another 2-4 hours, I would add:

View/edit role permissions for sharing
Document version history
Commenting
Better upload support, including .docx
More automated frontend and backend tests
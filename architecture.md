# Architecture Note

## Overview

Ajaia DocLite is a small full-stack document editor built with a React frontend, FastAPI backend, and SQLite persistence.

The product is intentionally scoped as a lightweight collaborative document editor, not a full Google Docs clone. I prioritized the flows reviewers can test quickly: creating a document, editing rich text, saving and reopening content, uploading text-based files, and sharing documents between users.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Testing | Pytest |
| Deployment | Render for backend, Vercel for frontend |

## Core Entities

### User

Seeded users are used to simulate login without spending time on full authentication.

Fields:

- id
- name
- email

### Document

Stores document ownership and content.

Fields:

- id
- title
- content_html
- owner_id
- created_at
- updated_at

### DocumentShare

Stores which users have access to which documents.

Fields:

- id
- document_id
- shared_with_user_id

## Frontend Design

The frontend starts with a homepage where a reviewer selects a team member. After login, the user sees three clear document sections:

1. My Documents
2. Shared By Me
3. Shared With Me

This makes the sharing model easy to understand and demonstrate.

The editor uses a browser content-editable area with formatting controls for bold, italic, underline, headings, bullets, and numbered lists. Content is saved as HTML so basic formatting can persist after refresh.

## Backend Design

The FastAPI backend owns:

- User retrieval
- Document creation
- Document opening
- Document updating
- Rename logic
- Delete logic
- File upload handling
- Share logic
- Access checks

The backend checks whether the user is the document owner or has been granted shared access before allowing document access.

## Persistence

SQLite is used because it is simple, local, and sufficient for this assignment scope. The database persists documents, content, owners, and sharing data after page refresh.

## Prioritized Scope

I prioritized:

- End-to-end working document lifecycle
- Clear sharing behavior
- Simple seeded-user login
- File upload in the document workflow
- Basic validation
- One meaningful automated test
- Fast setup and deployability

## Deprioritized Scope

I intentionally did not build:

- Real-time collaboration
- Comments
- Suggestion mode
- Version history
- Full authentication
- Enterprise-grade permissions
- .docx parsing

These were deprioritized because the assignment has a 4 hour timebox and asks for focused product judgment rather than a broad Google Docs clone.

## What I Would Build Next

With another 2-4 hours, I would add:

1. View/edit sharing permissions
2. Version history
3. Commenting
4. Better document import/export
5. More automated tests
6. Authentication with sessions or JWT
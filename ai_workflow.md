# AI Workflow Note

## AI Tools Used

I used ChatGPT as an AI coding and product-planning assistant during the assignment.

## Where AI Helped

AI helped speed up the work in these areas:

- Breaking the ambiguous assignment into a realistic MVP scope
- Prioritizing features for a 4-6 hour timebox
- Drafting the initial backend API structure
- Drafting React component structure
- Debugging local setup issues
- Creating documentation outlines
- Preparing the walkthrough video script

## What I Changed or Rejected

I did not use AI output as-is. I reviewed the suggestions, tested the application, and changed several parts based on the issues I found during implementation.

I rejected or deferred suggestions that were too large for the assignment timebox, including:

- Real-time multi-user editing
- Full production authentication
- Advanced role-based permissions
- Version history
- Comments and suggestion mode
- Complex .docx parsing

I also changed several AI-assisted outputs after testing the product:

- The first version opened directly into a user profile. I changed this to a homepage where reviewers can select which demo user they want to continue as.
- The first version did not clearly show documents shared by the current user. I added a **Shared By Me** section in addition to **My Documents** and **Shared With Me**.
- The editor initially showed “Start writing here...” as real document content. I changed this to behave like placeholder text so it disappears when the user starts typing.
- While testing the editor, typed text appeared backward because React was resetting the editor HTML after each input change and pushing the cursor back to the beginning. I changed the editor-loading logic so content is loaded when a document is opened, not after every keystroke.
- The document list initially did not make actions obvious. I added visible **Open**, **Rename**, and **Delete** buttons so reviewers can easily test document management.
- Refreshing the browser originally logged the user out and returned to the homepage. I added local browser storage so the selected user remains logged in after refresh.
- The title field originally treated “Untitled Document” as real text, so the user had to manually delete it before typing a new title. I changed the title behavior so the default title clears when the user focuses on the field and returns only if the field is left empty.

I kept the final scope focused on a working, reviewable product slice that reviewers can test end to end: document creation, editing, renaming, saving, reopening, upload, sharing, and persistence.
## How I Verified the Work

I verified correctness through:

- Manual testing in the browser
- Refresh testing to confirm persistence
- Switching users to confirm sharing behavior
- Testing uploaded .txt and .md files
- Checking FastAPI Swagger endpoints
- Running a Pytest backend test for document creation and sharing

## AI Usage Judgment

AI materially sped up implementation and documentation, but I used my own judgment to decide the final product scope. The final implementation focuses on the assignment’s required capabilities and avoids overbuilding features that would reduce reliability within the time limit.
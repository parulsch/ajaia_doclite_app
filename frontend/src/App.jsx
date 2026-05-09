import { useEffect, useRef, useState } from "react";
import {
  getUsers,
  getDocuments,
  getSharedByMe,
  getDocument,
  createDocument,
  updateDocument,
  shareDocument,
  uploadDocument,
  renameDocument,
  deleteDocument,
} from "./api";

function App() {
  const editorRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [loginUserId, setLoginUserId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [sharedByMeDocs, setSharedByMeDocs] = useState([]);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [shareUserId, setShareUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadDocuments();
      setSelectedDoc(null);
      setTitle("");
      setContentHtml("");
    }
  }, [currentUser]);

  useEffect(() => {
    if (editorRef.current && selectedDoc) {
      editorRef.current.innerHTML = selectedDoc.content_html || "";
    }
  }, [selectedDoc]);

  async function loadUsers() {
  try {
    const data = await getUsers();
    setUsers(data);

    const savedUserId = localStorage.getItem("doclite_current_user_id");

    if (savedUserId) {
      const savedUser = data.find((user) => user.id === Number(savedUserId));

      if (savedUser) {
        setCurrentUser(savedUser);
        setLoginUserId(savedUser.id);
        return;
      }
    }

    if (data.length > 0) {
      setLoginUserId(data[0].id);
    }
  } catch {
    setError("Unable to load users. Please check if backend is running.");
  }
}

  async function loadDocuments() {
    if (!currentUser) return;

    try {
      const data = await getDocuments(currentUser.id);
      const sharedByMe = await getSharedByMe(currentUser.id);

      setOwnedDocs(data.owned || []);
      setSharedDocs(data.shared || []);
      setSharedByMeDocs(sharedByMe || []);
    } catch {
      setError("Unable to load documents.");
    }
  }

  function handleLogin() {
  const selectedUser = users.find((user) => user.id === Number(loginUserId));

  if (!selectedUser) {
    setError("Please select a user to continue.");
    return;
  }

  localStorage.setItem("doclite_current_user_id", selectedUser.id);

  setCurrentUser(selectedUser);
  setMessage("");
  setError("");
}

  function handleLogout() {
  localStorage.removeItem("doclite_current_user_id");

  setCurrentUser(null);
  setSelectedDoc(null);
  setTitle("");
  setContentHtml("");
  setMessage("");
  setError("");
}

  async function handleCreateDocument() {
    clearMessages();

    try {
      const doc = await createDocument(currentUser.id);
      await loadDocuments();
      await openDocument(doc.id);
      setMessage("New document created.");
    } catch {
      setError("Unable to create document.");
    }
  }

  async function openDocument(documentId) {
    clearMessages();

    try {
      const doc = await getDocument(documentId, currentUser.id);
      setSelectedDoc(doc);
      setTitle(doc.title);
      setContentHtml(doc.content_html || "");
      setShareUserId("");
    } catch {
      setError("Unable to open document.");
    }
  }

  async function handleSave() {
    clearMessages();

    if (!selectedDoc) {
      setError("Please select or create a document first.");
      return;
    }

    if (!title.trim()) {
      setError("Document title cannot be empty.");
      return;
    }

    const html = editorRef.current ? editorRef.current.innerHTML : contentHtml;

    try {
      const updated = await updateDocument(
        selectedDoc.id,
        title,
        html,
        currentUser.id
      );

      setSelectedDoc(updated);
      setContentHtml(updated.content_html || "");
      await loadDocuments();
      setMessage("Document saved.");
    } catch {
      setError("Unable to save document.");
    }
  }

  async function handleRenameDocument(documentId, currentTitle) {
    clearMessages();

    const newTitle = window.prompt("Enter new document name:", currentTitle);

    if (newTitle === null) {
      return;
    }

    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      setError("Document title cannot be empty.");
      return;
    }

    try {
      const renamedDoc = await renameDocument(
        documentId,
        currentUser.id,
        cleanTitle
      );

      if (selectedDoc?.id === documentId) {
        setSelectedDoc(renamedDoc);
        setTitle(renamedDoc.title);
      }

      await loadDocuments();
      setMessage("Document renamed successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to rename document.");
    }
  }

  async function handleDeleteDocument(documentId) {
    clearMessages();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDocument(documentId, currentUser.id);

      if (selectedDoc?.id === documentId) {
        setSelectedDoc(null);
        setTitle("");
        setContentHtml("");
      }

      await loadDocuments();
      setMessage("Document deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to delete document.");
    }
  }

  async function handleShare() {
    clearMessages();

    if (!selectedDoc) {
      setError("Please select a document first.");
      return;
    }

    if (selectedDoc.owner_id !== currentUser.id) {
      setError("Only the owner can share this document.");
      return;
    }

    if (!shareUserId) {
      setError("Please select a user to share with.");
      return;
    }

    try {
      await shareDocument(selectedDoc.id, currentUser.id, Number(shareUserId));
      await loadDocuments();
      setMessage("Document shared successfully.");
      setShareUserId("");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to share document.");
    }
  }

  async function handleUpload(event) {
    clearMessages();

    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      const uploadedDoc = await uploadDocument(currentUser.id, file);
      await loadDocuments();
      await openDocument(uploadedDoc.id);
      setMessage("File uploaded and converted into an editable document.");
      event.target.value = "";
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to upload file.");
    }
  }

  function applyFormat(command, value = null) {
    document.execCommand(command, false, value);

    if (editorRef.current) {
      editorRef.current.focus();
      setContentHtml(editorRef.current.innerHTML);
    }
  }

  function handleEditorInput() {
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
  }

  function clearMessages() {
    setMessage("");
    setError("");
  }

  if (!currentUser) {
    return (
      <div className="home-page">
        <div className="home-card">
          <h1>Ajaia DocLite</h1>
          <p>
            A lightweight collaborative document editor for creating, editing,
            uploading, and sharing documents.
          </p>

          {error && <div className="message error">{error}</div>}

          <div className="login-box">
            <label>Select a team member</label>
            <select
              value={loginUserId}
              onChange={(event) => setLoginUserId(event.target.value)}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>

            <button className="primary-button" onClick={handleLogin}>
              Continue
            </button>
          </div>

          <div className="home-note">
            <strong>Demo users:</strong> Antony, Bubble, and Cecilea
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <h1>Ajaia DocLite</h1>
          <p>Signed in as {currentUser.name}</p>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Switch User
        </button>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <button className="primary-button" onClick={handleCreateDocument}>
            + New Document
          </button>

          <div className="upload-box">
            <label>Upload .txt or .md</label>
            <input type="file" accept=".txt,.md" onChange={handleUpload} />
          </div>

          <section>
            <h2>My Documents</h2>
            {ownedDocs.length === 0 && (
              <p className="empty">No owned documents yet.</p>
            )}

            {ownedDocs.map((doc) => (
              <div
                key={doc.id}
                className={`doc-card ${
                  selectedDoc?.id === doc.id ? "active" : ""
                }`}
              >
                <div>
                  <span>{doc.title}</span>
                  <small>Owner: You</small>
                </div>

                <div className="doc-actions">
                  <button onClick={() => openDocument(doc.id)}>Open</button>

                  <button onClick={() => handleRenameDocument(doc.id, doc.title)}>
                    Rename
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2>Shared By Me</h2>
            {sharedByMeDocs.length === 0 && (
              <p className="empty">No documents shared by you yet.</p>
            )}

            {sharedByMeDocs.map((share, index) => (
              <div
                key={`${share.document_id}-${share.shared_with_user_id}-${index}`}
                className="doc-card shared-by-me"
              >
                <div>
                  <span>{share.title}</span>
                  <small>Shared with: {share.shared_with_name}</small>
                </div>

                <div className="doc-actions">
                  <button onClick={() => openDocument(share.document_id)}>
                    Open
                  </button>

                  <button
                    onClick={() =>
                      handleRenameDocument(share.document_id, share.title)
                    }
                  >
                    Rename
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2>Shared With Me</h2>
            {sharedDocs.length === 0 && (
              <p className="empty">No shared documents yet.</p>
            )}

            {sharedDocs.map((doc) => (
              <div
                key={doc.id}
                className={`doc-card ${
                  selectedDoc?.id === doc.id ? "active" : ""
                }`}
              >
                <div>
                  <span>{doc.title}</span>
                  <small>Owner: {doc.owner_name}</small>
                </div>

                <div className="doc-actions">
                  <button onClick={() => openDocument(doc.id)}>Open</button>
                </div>
              </div>
            ))}
          </section>
        </aside>

        <section className="editor-panel">
          {message && <div className="message success">{message}</div>}
          {error && <div className="message error">{error}</div>}

          {!selectedDoc ? (
            <div className="placeholder">
              <h2>Welcome, {currentUser.name}</h2>
              <p>Create a document, upload a file, or open a shared document.</p>
            </div>
          ) : (
            <>
              <div className="document-header">
                <input
                  className="title-input"
                  value={title}
                  onFocus={() => {
                    if (title === "Untitled Document") {
                      setTitle("");
                    }
                 }}
                 onBlur={() => {
                   if (!title.trim()) {
                     setTitle("Untitled Document");
                    }
                 }}
                 onChange={(event) => setTitle(event.target.value)}
                 placeholder="Enter document title..."
                />

                <div className="access-badge">
                  {selectedDoc.access_type === "owned" ? "Owned" : "Shared"}
                </div>
              </div>

              <div className="toolbar">
                <button onClick={() => applyFormat("bold")}>Bold</button>
                <button onClick={() => applyFormat("italic")}>Italic</button>
                <button onClick={() => applyFormat("underline")}>Underline</button>
                <button onClick={() => applyFormat("formatBlock", "h1")}>
                  H1
                </button>
                <button onClick={() => applyFormat("formatBlock", "h2")}>
                  H2
                </button>
                <button onClick={() => applyFormat("formatBlock", "p")}>
                  Normal
                </button>
                <button onClick={() => applyFormat("insertUnorderedList")}>
                  Bullets
                </button>
                <button onClick={() => applyFormat("insertOrderedList")}>
                  Numbers
                </button>
              </div>

              <div
                ref={editorRef}
                className="editor"
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
              />

              <div className="actions">
                <button className="primary-button" onClick={handleSave}>
                  Save
                </button>

                {selectedDoc.owner_id === currentUser.id && (
                  <div className="share-box">
                    <select
                      value={shareUserId}
                      onChange={(event) => setShareUserId(event.target.value)}
                    >
                      <option value="">Share with...</option>
                      {users
                        .filter((user) => user.id !== currentUser.id)
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                    </select>

                    <button onClick={handleShare}>Share</button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
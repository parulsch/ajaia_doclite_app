import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function getUsers() {
  const response = await axios.get(`${API_BASE}/users`);
  return response.data;
}

export async function getDocuments(userId) {
  const response = await axios.get(`${API_BASE}/documents`, {
    params: { user_id: userId },
  });
  return response.data;
}

export async function getSharedByMe(userId) {
  const response = await axios.get(`${API_BASE}/documents/shared-by-me`, {
    params: { user_id: userId },
  });
  return response.data;
}

export async function getDocument(documentId, userId) {
  const response = await axios.get(`${API_BASE}/documents/${documentId}`, {
    params: { user_id: userId },
  });
  return response.data;
}

export async function createDocument(ownerId) {
  const response = await axios.post(`${API_BASE}/documents`, {
    title: "Untitled Document",
    content_html: "",
    owner_id: ownerId,
  });
  return response.data;
}

export async function updateDocument(documentId, title, contentHtml, userId) {
  const response = await axios.put(`${API_BASE}/documents/${documentId}`, {
    title,
    content_html: contentHtml,
    user_id: userId,
  });
  return response.data;
}

export async function shareDocument(documentId, ownerId, sharedWithUserId) {
  const response = await axios.post(`${API_BASE}/documents/${documentId}/share`, {
    owner_id: ownerId,
    shared_with_user_id: sharedWithUserId,
  });
  return response.data;
}

export async function uploadDocument(ownerId, file) {
  const formData = new FormData();
  formData.append("owner_id", ownerId);
  formData.append("file", file);

  const response = await axios.post(`${API_BASE}/documents/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
export async function deleteDocument(documentId, userId) {
  const response = await axios.delete(`${API_BASE}/documents/${documentId}`, {
    params: {
      user_id: userId,
    },
  });

  return response.data;
}
export async function renameDocument(documentId, userId, title) {
  const response = await axios.patch(
    `${API_BASE}/documents/${documentId}/rename`,
    null,
    {
      params: {
        user_id: userId,
        title,
      },
    }
  );

  return response.data;
}
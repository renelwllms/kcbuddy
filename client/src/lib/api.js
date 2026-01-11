const API_BASE =
  typeof window === "undefined" ? "/api" : `${window.location.origin}/api`;

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("kcbuddy_token");
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function registerFamily({ familyName, parentName, email }) {
  return apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ familyName, parentName, email })
  });
}

export function loginWithCode(code) {
  return apiFetch("/auth/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });
}

export function getKids() {
  return apiFetch("/kids", {
    headers: getAuthHeaders()
  });
}

export function createKid({ name, avatarUrl, goalAmount }) {
  return apiFetch("/kids", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, avatarUrl, goalAmount })
  });
}

export function updateKid(id, { name, avatarUrl, goalAmount }) {
  return apiFetch(`/kids/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ name, avatarUrl, goalAmount })
  });
}

export function getChores() {
  return apiFetch("/chores", {
    headers: getAuthHeaders()
  });
}

export function getChoresWithInactive() {
  return apiFetch("/chores?includeInactive=1", {
    headers: getAuthHeaders()
  });
}

export function createChore({ title, rewardAmount, description, category }) {
  return apiFetch("/chores", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ title, rewardAmount, description, category })
  });
}

export function updateChore(id, { title, rewardAmount, description, category }) {
  return apiFetch(`/chores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ title, rewardAmount, description, category })
  });
}

export function updateChoreStatus(id, active) {
  return apiFetch(`/chores/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ active })
  });
}

export function getSubmissions() {
  return apiFetch("/submissions", {
    headers: getAuthHeaders()
  });
}

export function decideSubmission(id, decision) {
  return apiFetch(`/submissions/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ decision })
  });
}

export function getKidGoal() {
  return apiFetch("/goals/me", {
    headers: getAuthHeaders()
  });
}

export function getPresignedUpload(contentType) {
  return apiFetch("/storage/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ contentType })
  });
}

export async function uploadPhotoLocal(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/storage/upload", {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  });
}

export function createSubmission({ choreId, photoUrl }) {
  return apiFetch("/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ choreId, photoUrl })
  });
}

export function updateKidGoal(goalAmount) {
  return apiFetch("/goals/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ goalAmount })
  });
}

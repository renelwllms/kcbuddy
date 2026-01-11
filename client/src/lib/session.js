export function readSession() {
  const token = localStorage.getItem("kcbuddy_token");
  const role = localStorage.getItem("kcbuddy_role");
  if (!token || !role) {
    return null;
  }

  return {
    token,
    role,
    name: localStorage.getItem("kcbuddy_name") || ""
  };
}

export function saveSession(response) {
  if (!response?.token || !response?.role) {
    return null;
  }

  localStorage.setItem("kcbuddy_token", response.token);
  localStorage.setItem("kcbuddy_role", response.role);
  localStorage.setItem("kcbuddy_name", response.user?.name || "");

  return {
    token: response.token,
    role: response.role,
    name: response.user?.name || ""
  };
}

export function clearSession() {
  localStorage.removeItem("kcbuddy_token");
  localStorage.removeItem("kcbuddy_role");
  localStorage.removeItem("kcbuddy_name");
}

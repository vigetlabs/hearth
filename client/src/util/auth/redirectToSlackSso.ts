const API_URL = import.meta.env.VITE_API_URL;

export function redirectToSlackSso() {
  window.location.href = `${API_URL}/users/auth/openid_connect`;
}

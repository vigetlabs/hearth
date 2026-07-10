const API_URL = import.meta.env.VITE_API_URL;

export function redirectToGoogleSso() {
  window.location.href = `${API_URL}/users/auth/google`;
}

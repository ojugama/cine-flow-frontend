import { api } from "../api/apiClient";
import { getSession, saveToken } from "../auth/session";

export function loginRequest(credentials) {
  return api.post("/auth/login", credentials, { skipAuth: true });
}

export async function authenticateUser(credentials) {
  try {
    const response = await loginRequest(credentials);

    if (response.success && response.data?.token) {
      saveToken(response.data.token);
      return { success: true, session: getSession() };
    }

    return {
      success: false,
      message: response.message || "Email o contraseña incorrectos.",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

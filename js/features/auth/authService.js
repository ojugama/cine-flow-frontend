import { loginRequest } from "./authApi.js";
import { saveToken } from "../../core/auth/session.js";

/** Devuelve { success, message }. */
export async function authenticateUser(credentials) {
  try {
    const responseData = await loginRequest(credentials);

    if (responseData.success && responseData.data && responseData.data.token) {
      saveToken(responseData.data.token);
      return { success: true, message: "OK" };
    }

    return {
      success: false,
      message: responseData.message || "Email o contraseña incorrectos.",
    };
  } catch (error) {
    console.error("Ha ocurrido un error en la autenticación: ", error);
    return { success: false, message: error.message };
  }
}

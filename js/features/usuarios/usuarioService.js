import { registerUsuarioRequest } from "./usuarioApi.js";

export async function registerUsuario(userData) {
  try {
    const responseData = await registerUsuarioRequest(userData);
    return { success: true, message: responseData.message };
  } catch (error) {
    console.error("Ha ocurrido un error en el registro de usuario: ", error);
    return { success: false, message: error.message };
  }
}

import { loginRequest } from "./authApi.js";

export async function authenticateUser(credentials) {
  try {
    const responseData = await loginRequest(credentials);
    if (responseData.success && responseData.data && responseData.data.token) {
      const token = responseData.data.token;
      localStorage.setItem("jwt_token", token);
      return true;
    } else {
      console.error(
        "Ha fallado el login desde el servidor: ",
        responseData.message,
      );
      return false;
    }
  } catch (error) {
    console.error("Ha ocurrido un error en la autenticación: ", error);
    return false;
  }
}

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

export function getRolToken() {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    return payload.rol;
  } catch (error) {
    console.error("Error al decodificar el token JWT: ", error);

    return null;
  }
}

import { fetchApi } from "../../core/api/apiClient.js";

export async function registerUsuarioRequest(userData) {
  return await fetchApi("/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

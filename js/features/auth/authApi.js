import { fetchApi } from "../../core/api/apiClient.js";

export async function loginRequest(credentials) {
  return await fetchApi("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(credentials),
  });
}

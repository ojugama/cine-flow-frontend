import { fetchApi } from "../../core/api/apiClient.js";

export async function loginRequest(credentials) {
  return await fetchApi("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

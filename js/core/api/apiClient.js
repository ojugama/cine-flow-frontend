const API_BASE_URL = "http://localhost:8081/api";

export async function fetchApi(endpoint, options = {}) {
  try {
    const token = localStorage.getItem("jwt_token");
    const headers = {
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const jsonResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("jwt_token");
        window.location.href = "../../index.html";
      }
      throw new Error(
        jsonResponse.message || "Ha ocurrido un error en la petición.",
      );
    }

    return jsonResponse;
  } catch (error) {
    console.error(`Ha ocurrido un error en API (${endpoint}): `, error);
    throw error;
  }
}

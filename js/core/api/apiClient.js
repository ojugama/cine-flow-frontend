const API_BASE_URL = "http://localhost:8081/api";

export async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const jsonResponse = await response.json();

    if (!response.ok) {
      throw new Error(
        jsonResponse.message || "Las credenciales son inválidas.",
      );
    }

    return jsonResponse;
  } catch (error) {
    console.error(`Ha ocurrido un error en API (${endpoint}): `, error);
    throw error;
  }
}

const TOKEN_KEY = "jwt_token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

function decodePayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Devuelve { email, rol, exp } si hay un token vigente; null en caso contrario.
 * Solo sirve para decidir qué mostrar: la seguridad real la aplica el backend.
 */
export function getSession() {
  const token = getToken();
  if (!token) return null;

  const payload = decodePayload(token);
  if (!payload || !payload.exp || payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return { email: payload.sub, rol: payload.rol, exp: payload.exp };
}

export function isAdmin() {
  return getSession()?.rol === "ADMIN";
}

export function logout(query = "") {
  clearSession();
  window.location.replace(`/index.html${query}`);
}

/** Protege una página privada. Devuelve la sesión o null (y redirige). */
export function requireAuth({ adminOnly = false } = {}) {
  const session = getSession();

  if (!session) {
    logout(getToken() ? "?expired=1" : "");
    return null;
  }

  if (adminOnly && session.rol !== "ADMIN") {
    window.location.replace("/pages/cliente/dashboard.html");
    return null;
  }

  return session;
}

/** Para login/registro: si ya hay sesión, no tiene sentido mostrarlos. */
export function redirectIfAuthenticated() {
  if (getSession()) {
    window.location.replace("/pages/cliente/dashboard.html");
    return true;
  }
  return false;
}

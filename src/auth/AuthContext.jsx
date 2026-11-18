import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { authenticateUser } from "../services/authService";
import { clearSession, getSession, getToken, saveToken } from "./session";

const AuthContext = createContext(null);

function readSession() {
  return getToken() ? getSession() : null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setSession(null);
      navigate("/login", { replace: true });
    };

    window.addEventListener("cineflow:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("cineflow:unauthorized", onUnauthorized);
  }, [navigate]);

  const login = useCallback(async (credentials) => {
    const result = await authenticateUser(credentials);
    if (result.success) {
      setSession(result.session);
    }
    return result;
  }, []);

  const refreshSession = useCallback((token) => {
    if (token) {
      saveToken(token);
    }
    setSession(readSession());
  }, []);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isAdmin: session?.rol === "ADMIN",
      isClient: session?.rol === "CLIENTE",
      login,
      logout,
      refreshSession,
    }),
    [session, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

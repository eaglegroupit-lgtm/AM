import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken, clearToken, getToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUsername(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUsername(me.username);
    } catch {
      clearToken();
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (user, pass) => {
    const data = await api.login(user, pass);
    setToken(data.token);
    setUsername(data.username);
    return data;
  };

  const logout = () => {
    clearToken();
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, loading, login, logout, isAuthenticated: !!username }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

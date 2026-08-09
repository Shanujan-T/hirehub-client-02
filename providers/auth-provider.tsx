"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authService from "@/services/auth";
import type { LoginPayload, RegisterPayload, User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
      localStorage.setItem("user", JSON.stringify(me));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  const updateUser = useCallback((next: User) => {
    setUser(next);
    localStorage.setItem("user", JSON.stringify(next));
  }, []);

  useEffect(() => {
    let active = true;

    const hydrateAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const me = await authService.getMe();
        if (!active) return;
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      } catch {
        if (!active) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        if (active) setLoading(false);
      }
    };

    void hydrateAuth();
    return () => {
      active = false;
    };
  }, []);

  const login = async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const register = async (payload: RegisterPayload) => {
    const data = await authService.register(payload);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getDashboardPath(user: User | null, isCommunityAdmin = false): string {
  if (!user) return "/auth/login";
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "employer") return "/employer/dashboard";
  void isCommunityAdmin;
  return "/user/dashboard";
}

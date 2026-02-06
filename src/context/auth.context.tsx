/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useState } from "react";

type LoginSuccess = { ok: true; token: string };
type LoginFailure = { ok: false; msg: string };
export type LoginResult = LoginSuccess | LoginFailure;

type ApiResponse = { ok?: boolean; msg?: string; message?: string; [key: string]: unknown };

export type UserProfile = {
  id: number
  name: string
  email: string
  password?: string
  role_id?: number
  isActive?: boolean
  created_at?: string
  updated_at?: string | null
  [key: string]: unknown
}

export type AuthContextValue = {
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, username: string) => Promise<LoginResult>;
  logout: () => void;
  loading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  // When true the app should prompt the user to change their password (first login)
  mustChangePassword: boolean;
  // Call to change the current user's password
  changePassword: (password: string) => Promise<{ ok: boolean; msg?: string }>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      // read token from cookie instead of localStorage
      const match = document.cookie.match('(?:^|;)\\s*token=([^;]*)')
      return match ? decodeURIComponent(match[1]) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const base = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3001";
  const apiBase = base.replace(/\/$/, "");

  const persistToken = (t: string) => {
    try {
      // set cookie. Use a reasonable max-age (8 hours)
      const maxAge = 60 * 60 * 8 // 8 hours
      document.cookie = `token=${encodeURIComponent(t)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    } catch (e) {
      console.warn("Could not persist token to cookies", e);
    }
  };

  const fetchProfile = useCallback(
    async (t: string) => {
      const url = `${apiBase}/api/v1/profile`;
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${t}`,
          },
        });
        if (!response.ok) {
          // clear profile on unauthorized
          if (response.status === 401 || response.status === 403) {
            setProfile(null);
          }
          return null;
        }
        const data = await response.json();
        const p = data?.msg ?? null;
        if (p) setProfile(p as UserProfile);
        return p as UserProfile | null;
      } catch (err) {
        console.warn("fetchProfile error", err);
        return null;
      }
    },
    [apiBase]
  );

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    const url = `${apiBase}/api/v1/login`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      let data: ApiResponse | null = null;
      try {
        data = await response.json();
      } catch (err) {
        void err;
      }

      if (!response.ok) {
        const msg = data?.msg || data?.message || `HTTP ${response.status}`;
        return { ok: false, msg };
      }

      const t = data?.msg;
      if (t && typeof t === "string") {
        persistToken(t);
        setToken(t);
        // fetch and store profile after successful login (wait for result so we can inspect isActive)
        const p = await fetchProfile(t);
        // if profile indicates inactive and the provided password is the default, request password change
        if (p && p.isActive === false && password === "123456") {
          setMustChangePassword(true);
        } else {
          setMustChangePassword(false);
        }
        return { ok: true, token: t };
      }
      return { ok: false, msg: data?.msg || "Login no devolvió token" };
    } catch (error: unknown) {
      return { ok: false, msg: (error as Error)?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  }, [apiBase, fetchProfile]);

  const changePassword = useCallback(async (newPassword: string) => {
    if (!token || !profile) return { ok: false, msg: "No autenticado" };
    const url = `${apiBase}/api/v1/users/${profile.id}`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // also set isActive to true on first password change
        body: JSON.stringify({ password: newPassword, isActive: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.msg || data?.message || `HTTP ${res.status}`;
        return { ok: false, msg };
      }
      // refresh profile
      await fetchProfile(token);
      setMustChangePassword(false);
      return { ok: true };
    } catch (err) {
      return { ok: false, msg: (err as Error)?.message || String(err) };
    }
  }, [apiBase, profile, token, fetchProfile]);

  const register = useCallback(async (email: string, password: string, username: string): Promise<LoginResult> => {
    setLoading(true);
    const url = `${apiBase}/api/v1/users`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      let data: ApiResponse | null = null;
      try {
        data = await response.json();
      } catch (err) {
        void err;
      }

      if (!response.ok) {
        const msg = data?.msg || data?.message || `HTTP ${response.status}`;
        return { ok: false, msg };
      }

      const t = data?.msg;
      if (t && typeof t === "string") {
        persistToken(t);
        setToken(t);
        return { ok: true, token: t };
      }
      return { ok: false, msg: data?.msg || "Register no devolvió token" };
    } catch (error: unknown) {
      return { ok: false, msg: (error as Error)?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  const logout = useCallback(() => {
    try {
      // remove cookie by setting expiry in the past
      document.cookie = `token=; Path=/; Max-Age=0; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`
    } catch (e) {
      console.warn("Could not remove token cookie", e);
    }
    setToken(null);
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    login,
    register,
    logout,
    loading,
    token,
    isAuthenticated,
    profile,
    mustChangePassword,
    changePassword,
  };

  // If there's an existing token on mount, fetch the profile once.
  useEffect(() => {
    if (token) {
      void fetchProfile(token);
    }
  }, [token, fetchProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

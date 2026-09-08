"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    gender: string | null;
    preferred_language: string | null;
    preferred_currency: string | null;
  };
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("falcon_auth_token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("falcon_auth_token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        logout();
        return;
      }

      setUser(result.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
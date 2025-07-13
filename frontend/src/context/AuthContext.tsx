import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { login as loginApi, register as registerApi, resetPw as resetPwApi, confirmResetPw as confirmResetPwApi } from "../services/authApi";
import type { ConfirmResetPasswordPayload, ForgotPwPayload, LoginPayload, LoginResponse, RegisterPayload } from "../types/auth";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<void>;
  resetPw: (payload: ForgotPwPayload) => Promise<void>;
  confirmResetPw: (payload: ConfirmResetPasswordPayload) => Promise<void>;
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  useEffect(() => {
    if (accessToken) {
      // Optionally decode token to get user info
      setUser({}); // Set user info here if you decode JWT
    } else {
      setUser(null);
    }
  }, [accessToken]);

  const login = async (payload: LoginPayload) => {
    const data: LoginResponse = await loginApi(payload);
    if (data.token) {
      setAccessToken(data.token);
      localStorage.setItem("accessToken", data.token);
    }
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    setUser({});
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const register = async (payload: RegisterPayload) => {
    await registerApi(payload);
  };

  const resetPw = async (payload: ForgotPwPayload) => {
    await resetPwApi(payload);
  };

  const confirmResetPw = async (payload: ConfirmResetPasswordPayload) => {
    await confirmResetPwApi(payload);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!accessToken,
        login,
        logout,
        register,
        resetPw,
        confirmResetPw,
        accessToken,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
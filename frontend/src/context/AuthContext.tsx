import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { login as loginApi, register as registerApi, resetPw as resetPwApi, confirmResetPw as confirmResetPwApi, getProfile } from "../services/authApi";
import { getUserByEmail } from "../services/userApi";
import type { ConfirmResetPasswordPayload, ForgotPwPayload, LoginPayload, LoginResponse, RegisterPayload, User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<void>;
  resetPw: (payload: ForgotPwPayload) => Promise<void>;
  confirmResetPw: (payload: ConfirmResetPasswordPayload) => Promise<void>;
  refreshUser: () => Promise<void>;
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );

  useEffect(() => {
    if (accessToken) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } else {
      setUser(null);
    }
  }, [accessToken]);

  const login = async (payload: LoginPayload) => {
    const data: LoginResponse = await loginApi(payload);
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
    }
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    
    // Handle user data - either from nested user object or directly from response
    if (data.user) {
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } else if (data.email) {
      const userData: User = {
        email: data.email,
        ...(data.role && { role: data.role })
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
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

  const refreshUser = async () => {
    if (accessToken && user?.email) {
      try {
        // Use the working getUserByEmail API since getProfile() doesn't work with our current backend endpoints
        const userData = await getUserByEmail(user.email);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // Fallback to getProfile if getUserByEmail fails
        try {
          const userData = await getProfile();
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (fallbackError) {
          console.error('Fallback getProfile also failed:', fallbackError);
        }
      }
    }
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
        refreshUser,
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
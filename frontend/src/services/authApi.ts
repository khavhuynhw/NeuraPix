import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
  [key: string]: any;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}auth/login`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Save JWT token to localStorage if present
    if (response.data.token) {
      localStorage.setItem("jwt_token", response.data.token);
    }

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Login failed");
  }
}
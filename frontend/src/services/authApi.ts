import axios from "axios";
import type { LoginPayload, LoginResponse, RegisterPayload } from "../types/auth";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Authenticates a user and returns a JWT token.
 * @param {LoginPayload} payload - The login credentials.
 * @returns {Promise<LoginResponse>} - The response containing the JWT token or error message.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/login`,
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

/**
 * Registers a new user.
 * @param {RegisterPayload} payload - The registration data.
 */
export async function register(payload: RegisterPayload): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/auth/register`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Registration failed");
  }
}
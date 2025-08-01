import axios from "axios";
import type { ConfirmResetPasswordPayload, ForgotPwPayload, LoginPayload, LoginResponse, RegisterPayload } from "../types/auth";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";


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

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
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

/**
 * @param {ForgotPwPayload} payload - The reset password data.
 */
export async function resetPw(payload: ForgotPwPayload): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/auth/reset-password`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Reset password failed");
    }
    throw new Error("Reset password failed");
  }
}

/**
 * @param {ConfirmResetPasswordPayload} payload - The reset password data.
 */

export async function confirmResetPw(
  payload: ConfirmResetPasswordPayload
): Promise<void> {
  console.log(payload)
  try {
    await axios.post(`${BASE_URL}/auth/reset-password/confirm`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Reset failed");
    }
    throw new Error("Reset failed");
  }
}
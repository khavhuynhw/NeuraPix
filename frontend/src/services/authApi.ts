import axios from "axios";
import type { ChangePasswordRequest, ConfirmResetPasswordPayload, ForgotPwPayload, LoginPayload, LoginResponse, RegisterPayload, User } from "../types/auth";


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const AUTH_BASE_URL = `${BASE_URL}/api/v1/auth`;


export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axios.post(
      `${AUTH_BASE_URL}/login`,
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
    await axios.post(`${AUTH_BASE_URL}/register`, payload, {
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
    await axios.post(`${AUTH_BASE_URL}/reset-password`, payload, {
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
    await axios.post(`${AUTH_BASE_URL}/reset-password/confirm`, payload, {
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

/**
 * Changes the current user's password
 */
export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }

    await axios.post(`${AUTH_BASE_URL}/change-password`, payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to change password");
    }
    throw new Error("Failed to change password");
  }
}

/**
 * Gets the current user's profile information
 */
export async function getProfile(): Promise<User> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }

    // Try multiple possible endpoints for getting current user profile
    let response;
    try {
      // First try the common /auth/me endpoint
      response = await axios.get(`${AUTH_BASE_URL}/me`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    } catch (authError) {
      // If that fails, try /users/me endpoint
      try {
        response = await axios.get(`${BASE_URL}/api/v1/users/me`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (usersError) {
        // If that also fails, try /auth/profile endpoint
        response = await axios.get(`${AUTH_BASE_URL}/profile`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    }

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to get profile");
    }
    throw new Error("Failed to get profile");
  }
}

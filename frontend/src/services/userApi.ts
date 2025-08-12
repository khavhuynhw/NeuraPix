import axios from "axios";
import type { User, UserCreateRequestDto, UserUpdateRequestDto } from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const USERS_BASE_URL = `${BASE_URL}/api/v1/users`;

/**
 * Fetches user data by email
 * @param {string} email - The user's email address
 * @returns {Promise<User>} - The user data
 */
export async function getUserByEmail(email: string): Promise<User> {
  try {
    const response = await axios.get(`${USERS_BASE_URL}/email/${email}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch user data");
    }
    throw new Error("Failed to fetch user data");
  }
} 

export async function getUserById(userId: String): Promise<User> {
  try {
    const response = await axios.get(`${USERS_BASE_URL}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch user data");
    }
    throw new Error("Failed to fetch user data");
  }
}

/**
 * Fetches all users with pagination and filtering
 * @param {Object} params - Query parameters for filtering and pagination
 * @returns {Promise<{users: User[], total: number}>} - Users data with total count
 */
export async function getAllUsers(params?: {
  page?: number;
  size?: number;
  search?: string;
  role?: string;
  status?: string;
  plan?: string;
}): Promise<{ users: User[]; total: number; page: number; size: number }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role && params.role !== 'all') queryParams.append('role', params.role);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.plan && params.plan !== 'all') queryParams.append('plan', params.plan);

    const response = await axios.get(`${USERS_BASE_URL}?${queryParams.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to fetch users");
    }
    throw new Error("Failed to fetch users");
  }
}

/**
 * Creates a new user
 * @param {UserCreateRequestDto} userData - User data to create
 * @returns {Promise<User>} - Created user data
 */
export async function createUser(userData: UserCreateRequestDto): Promise<User> {
  try {
    const response = await axios.post(`${USERS_BASE_URL}`, userData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to create user");
    }
    throw new Error("Failed to create user");
  }
}

/**
 * Updates an existing user
 * @param {number} id - User ID to update
 * @param {UserUpdateRequestDto} userData - User data to update
 * @returns {Promise<User>} - Updated user data
 */
export async function updateUser(id: number, userData: UserUpdateRequestDto): Promise<User> {
  try {
    const response = await axios.put(`${USERS_BASE_URL}/${id}`, userData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to update user");
    }
    throw new Error("Failed to update user");
  }
}

/**
 * Deletes a user
 * @param {number} userId - User ID to delete
 * @returns {Promise<void>}
 */
export async function deleteUser(userId: number): Promise<void> {
  try {
    await axios.delete(`${USERS_BASE_URL}/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to delete user");
    }
    throw new Error("Failed to delete user");
  }
}

/**
 * Updates user status (activate/deactivate)
 * @param {number} userId - User ID
 * @param {boolean} isActive - New status
 * @returns {Promise<User>} - Updated user data
 */
export async function updateUserStatus(userId: number, isActive: boolean): Promise<User> {
  try {
    const response = await axios.patch(`${USERS_BASE_URL}/${userId}/status`, { isActive }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to update user status");
    }
    throw new Error("Failed to update user status");
  }
}

/**
 * Bulk update users
 * @param {number[]} userIds - Array of user IDs
 * @param {string} action - Action to perform (activate, deactivate, delete)
 * @returns {Promise<void>}
 */
export async function bulkUpdateUsers(userIds: number[], action: string): Promise<void> {
  try {
    await axios.post(`${BASE_URL}/users/bulk`, { userIds, action }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Failed to perform bulk action");
    }
    throw new Error("Failed to perform bulk action");
  }
}
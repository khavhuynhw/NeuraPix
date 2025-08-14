import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Create axios instance with auth headers
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MonthlyUsageResponse {
  year: number;
  month: number;
  usage: number;
  remaining: number;
  hasExceededLimit: boolean;
}

export interface DailyUsageResponse {
  date: string;
  usage: number;
  remaining: number;
  hasExceededLimit: boolean;
}

export interface UserLimitsResponse {
  hasExceededDailyLimit: boolean;
  hasExceededMonthlyLimit: boolean;
  remainingDailyGenerations: number;
  remainingMonthlyGenerations: number;
  canGenerate: boolean;
}

export interface ComprehensiveUsageInfo {
  dailyUsage: {
    currentUsage: number;
    limit: number;
    remaining: number;
    hasExceededDailyLimit: boolean;
    subscriptionTier: string;
    message: string;
  };
  monthlyUsage: {
    currentUsage: number;
    limit: number;
    remaining: number;
    hasExceededMonthlyLimit: boolean;
    subscriptionTier: string;
    message: string;
  };
}

export const usageApi = {
  // Get monthly usage for a user
  getMonthlyUsage: async (userId: number): Promise<MonthlyUsageResponse> => {
    const response = await apiClient.get(`/api/v1/usage-tracking/monthly-usage/${userId}`);
    return response.data;
  },

  // Get daily usage for a user
  getDailyUsage: async (userId: number): Promise<DailyUsageResponse> => {
    const response = await apiClient.get(`/api/v1/usage-tracking/daily-usage/${userId}`);
    return response.data;
  },

  // Get user limits
  getUserLimits: async (userId: number): Promise<UserLimitsResponse> => {
    const response = await apiClient.get(`/api/v1/usage-tracking/limits/${userId}`);
    return response.data;
  },

  // Get comprehensive usage information
  getComprehensiveUsageInfo: async (userId: number): Promise<ComprehensiveUsageInfo> => {
    const response = await apiClient.get(`/api/v1/usage-tracking/comprehensive/${userId}`);
    return response.data;
  },

  // Reset daily usage
  resetDailyUsage: async (userId: number): Promise<string> => {
    const response = await apiClient.post(`/api/v1/usage-tracking/reset-daily/${userId}`);
    return response.data;
  },

  // Reset monthly usage
  resetMonthlyUsage: async (userId: number): Promise<string> => {
    const response = await apiClient.post(`/api/v1/usage-tracking/reset-monthly/${userId}`);
    return response.data;
  },

  // Reset usage by email
  resetUsageByEmail: async (email: string): Promise<string> => {
    const response = await apiClient.post(`/api/v1/usage-tracking/reset-usage-by-email?email=${email}`, {});
    return response.data;
  },

  // Check if user can generate images
  canGenerateImage: async (userId: number): Promise<{
    canGenerate: boolean;
    remainingDaily: number;
    remainingMonthly: number;
  }> => {
    const response = await apiClient.get(`/api/v1/usage-tracking/can-generate/${userId}`);
    return response.data;
  },
};
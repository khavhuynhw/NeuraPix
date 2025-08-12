import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Types
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  tier: string;
  monthlyPrice: number;
  yearlyPrice: number;
  dailyGenerationLimit: number;
  monthlyGenerationLimit: number;
  features: string[];
}

export interface Subscription {
  id: number;
  userId: number;
  tier: string;
  status: string;
  billingCycle: string;
  price: number;
  currency: string;
  paymentProvider: string;
  autoRenew: boolean;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  plan: SubscriptionPlan;
}

export interface CreateSubscriptionRequest {
  userId: number;
  tier: string;
  billingCycle: "MONTHLY" | "YEARLY";
  paymentProvider: "payos";
  autoRenew?: boolean;
}

export interface UpdateSubscriptionRequest {
  tier?: string;
  billingCycle?: "MONTHLY" | "YEARLY";
  autoRenew?: boolean;
}

export interface CancelSubscriptionRequest {
  reason: string;
  cancelImmediately: boolean;
}

class SubscriptionApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await axios.get(`${BASE_URL}/plans/active`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Get subscription plans error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get subscription plans");
      }
      throw new Error("Failed to get subscription plans");
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await axios.post(`${BASE_URL}/subscriptions`, request, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to create subscription");
      }
      throw new Error("Failed to create subscription");
    }
  }

  async getUserSubscription(userId: number): Promise<Subscription | null> {
    try {
      const response = await axios.get(`${BASE_URL}/subscriptions/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get user subscription");
      }
      throw new Error("Failed to get user subscription");
    }
  }

  async updateSubscription(subscriptionId: number, request: UpdateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await axios.put(`${BASE_URL}/subscriptions/${subscriptionId}`, request, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to update subscription");
      }
      throw new Error("Failed to update subscription");
    }
  }

  async cancelSubscription(subscriptionId: number, request: CancelSubscriptionRequest): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/subscriptions/${subscriptionId}/cancel`, request, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to cancel subscription");
      }
      throw new Error("Failed to cancel subscription");
    }
  }

  async renewSubscription(subscriptionId: number): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/subscriptions/${subscriptionId}/renew`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to renew subscription");
      }
      throw new Error("Failed to renew subscription");
    }
  }
}

export const subscriptionApi = new SubscriptionApiService();
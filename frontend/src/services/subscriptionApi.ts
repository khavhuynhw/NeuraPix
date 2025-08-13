import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const SUBSCRIPTION_BASE_URL = `${BASE_URL}/api/v1/subscriptions`;
const PLANS_BASE_URL = `${BASE_URL}/api/v1/plans`;

// Types
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  dailyGenerationLimit: number;
  monthlyGenerationLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  billingCycle: 'MONTHLY' | 'YEARLY';
  price: number;
  currency: string;
  paymentProvider: 'payos' | 'stripe' | 'momo';
  autoRenew: boolean;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
}

export interface CreateSubscriptionRequest {
  userId: number;
  planId?: number;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentProvider: 'payos' | 'stripe' | 'momo';
  autoRenew?: boolean;
}

export interface UpdateSubscriptionRequest {
  planId?: number;
  tier?: 'FREE' | 'BASIC' | 'PREMIUM';
  billingCycle?: 'MONTHLY' | 'YEARLY';
  autoRenew?: boolean;
}

export interface CancelSubscriptionRequest {
  reason: string;
  cancelImmediately: boolean;
}

export interface SubscriptionResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
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
      const response = await axios.get(`${PLANS_BASE_URL}/active`, {
        headers: this.getAuthHeaders(),
      });

      // Handle both direct data and wrapped response
      if (response.data.success !== undefined) {
        return response.data.data || response.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get subscription plans error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get subscription plans");
      }
      throw new Error("Failed to get subscription plans");
    }
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await axios.get(`${PLANS_BASE_URL}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data || response.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get all subscription plans error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get subscription plans");
      }
      throw new Error("Failed to get subscription plans");
    }
  }

  async getSubscriptionPlan(planId: number): Promise<SubscriptionPlan> {
    try {
      const response = await axios.get(`${PLANS_BASE_URL}/${planId}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Get subscription plan error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get subscription plan");
      }
      throw new Error("Failed to get subscription plan");
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      console.log('Creating subscription with request:', request);
      const response = await axios.post(`${SUBSCRIPTION_BASE_URL}`, request, {
        headers: this.getAuthHeaders(),
      });

      console.log('Subscription creation response:', response.data);
      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Create subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to create subscription");
      }
      throw new Error("Failed to create subscription");
    }
  }

  async getUserSubscription(userId: number): Promise<Subscription | null> {
    try {
      const response = await axios.get(`${SUBSCRIPTION_BASE_URL}/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Get user subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get user subscription");
      }
      throw new Error("Failed to get user subscription");
    }
  }

  async getCurrentUserSubscription(): Promise<Subscription | null> {
    try {
      const response = await axios.get(`${SUBSCRIPTION_BASE_URL}/me`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Get current user subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get current subscription");
      }
      throw new Error("Failed to get current subscription");
    }
  }

  async updateSubscription(subscriptionId: number, request: UpdateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await axios.put(`${SUBSCRIPTION_BASE_URL}/${subscriptionId}`, request, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Update subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to update subscription");
      }
      throw new Error("Failed to update subscription");
    }
  }

  async cancelSubscription(subscriptionId: number, request: CancelSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await axios.post(`${SUBSCRIPTION_BASE_URL}/${subscriptionId}/cancel`, request, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to cancel subscription");
      }
      throw new Error("Failed to cancel subscription");
    }
  }

  async renewSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await axios.post(`${SUBSCRIPTION_BASE_URL}/${subscriptionId}/renew`, {}, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Renew subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to renew subscription");
      }
      throw new Error("Failed to renew subscription");
    }
  }

  async activateSubscription(subscriptionId: number): Promise<Subscription> {
    try {
      const response = await axios.post(`${SUBSCRIPTION_BASE_URL}/${subscriptionId}/activate`, {}, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Activate subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to activate subscription");
      }
      throw new Error("Failed to activate subscription");
    }
  }

  async suspendSubscription(subscriptionId: number, reason: string): Promise<Subscription> {
    try {
      const response = await axios.post(`${SUBSCRIPTION_BASE_URL}/${subscriptionId}/suspend`, { reason }, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success !== undefined) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error('Suspend subscription error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to suspend subscription");
      }
      throw new Error("Failed to suspend subscription");
    }
  }

  async upgradeSubscription(subscriptionId: number, upgradeData: {
    newTier: string;
    reason: string;
    upgradeImmediately: boolean;
    paymentMethod?: string;
    paymentOrderCode?: number;
  }): Promise<{ success: boolean; message?: string; subscription?: Subscription }> {
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/subscriptions/${subscriptionId}/upgrade`, upgradeData, {
        headers: this.getAuthHeaders(),
      });

      return {
        success: response.data.success,
        message: response.data.message,
        subscription: response.data.subscription,
      };
    } catch (error: any) {
      console.error('Upgrade subscription error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Failed to upgrade subscription");
    }
  }
}

export const subscriptionApi = new SubscriptionApiService();
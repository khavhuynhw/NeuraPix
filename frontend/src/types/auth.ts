export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message?: string;
  [key: string]: any;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPwPayload {
  email: string;
}

export interface ConfirmResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  credits: number;
  subscriptionTier: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  tier: 'FREE' | 'BASIC' | 'PREMIUM';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string;
  nextBillingDate: string | null;
  price: number;
  currency: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentProvider: string | null;
  externalSubscriptionId: string | null;
  autoRenew: boolean;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  // user?: UserResponse; // Uncomment if you want to include user details
}

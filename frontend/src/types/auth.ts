export interface User {
  id?: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  role?: string;
  avatarUrl?: string | null;
  credits?: number;
  subscriptionTier?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Optional fields for UI display (computed/fallback values)
  name?: string;
  length?: number;
  bio?: string;
  avatar?: string;
  plan?: string;
  joinDate?: string;
  imagesGenerated?: number;
  favoriteImages?: number;
  downloadsThisMonth?: number;
  totalLimit?: number;
  imagesRemaining?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  email?: string;
  role?: string;
  user?: User;
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type UserRole = "USER" | "ADMIN";

export type SubscriptionTier = "FREE" | "PREMIUM";

export interface UserCreateRequestDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  credits?: number;
  subscriptionTier?: SubscriptionTier;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UserUpdateRequestDto {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  credits?: number;
  subscriptionTier?: SubscriptionTier;
  isActive?: boolean;
  emailVerified?: boolean;
}

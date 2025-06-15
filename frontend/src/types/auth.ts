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

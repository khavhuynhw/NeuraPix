export interface Transaction {
  id: number;
  orderCode: number;
  userId: number;
  subscriptionId?: number;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  paymentProvider: string;
  description?: string;
  buyerEmail: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  subscription?: {
    id: number;
    tier: string;
    status: string;
  };
}

export type TransactionStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED';

export type TransactionType = 'SUBSCRIPTION_PAYMENT' | 'SUBSCRIPTION_RENEWAL' | 'ONE_TIME_PAYMENT';

export interface TransactionFilters {
  userId?: number;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  page?: number;
  size?: number;
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  total?: number;
  filters?: TransactionFilters;
  message?: string;
}

export interface TransactionStats {
  pendingCount: number;
  paidCount: number;
  cancelledCount: number;
  failedCount: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface TransactionSearchParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  page?: number;
  size?: number;
}
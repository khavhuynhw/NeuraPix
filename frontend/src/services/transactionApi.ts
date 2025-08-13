import axios from "axios";
import type { Transaction, TransactionResponse, TransactionSearchParams, TransactionStats } from "../types/transaction";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const TRANSACTION_BASE_URL = `${BASE_URL}/api/v2/transactions`;

class TransactionApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: number): Promise<Transaction> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get transaction");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get transaction";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get transaction by order code
   */
  async getTransactionByOrderCode(orderCode: number): Promise<Transaction> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/order/${orderCode}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get transaction");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get transaction";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get user transactions with pagination
   */
  async getUserTransactions(
    userId: number,
    page: number = 0,
    size: number = 20
  ): Promise<TransactionResponse> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/user/${userId}`, {
        headers: this.getAuthHeaders(),
        params: { page, size },
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          pagination: response.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to get user transactions");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get user transactions";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get subscription transactions
   */
  async getSubscriptionTransactions(subscriptionId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/subscription/${subscriptionId}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get subscription transactions");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get subscription transactions";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get transactions by status
   */
  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/status/${status}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get transactions by status");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get transactions by status";
      throw new Error(errorMessage);
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(): Promise<TransactionStats> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to get transaction stats");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get transaction stats";
      throw new Error(errorMessage);
    }
  }

  /**
   * Search transactions with filters
   */
  async searchTransactions(params: TransactionSearchParams): Promise<TransactionResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`${TRANSACTION_BASE_URL}/search?${queryParams.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          total: response.data.total,
          filters: response.data.filters,
        };
      }
      throw new Error(response.data.message || "Failed to search transactions");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search transactions";
      throw new Error(errorMessage);
    }
  }

  /**
   * Export transactions to CSV (helper method)
   */
  exportTransactionsToCSV(transactions: Transaction[], filename: string = 'transactions.csv'): void {
    const headers = [
      'Date',
      'Order Code',
      'Amount',
      'Currency',
      'Status',
      'Type',
      'Payment Provider',
      'Payment Method',
      'Description',
      'Buyer Email'
    ];

    const csvData = transactions.map(transaction => [
      new Date(transaction.createdAt).toLocaleDateString(),
      transaction.orderCode,
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.type,
      transaction.paymentProvider,
      transaction.paymentMethod || '',
      transaction.description || '',
      transaction.buyerEmail
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount: number, currency: string = 'VND'): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      PAID: '#52c41a',
      PENDING: '#faad14',
      CANCELLED: '#ff4d4f',
      FAILED: '#ff4d4f',
    };
    return statusColors[status] || '#d9d9d9';
  }

  /**
   * Get status badge type for Ant Design
   */
  getStatusBadgeType(status: string): 'success' | 'processing' | 'error' | 'warning' | 'default' {
    const statusTypes: Record<string, 'success' | 'processing' | 'error' | 'warning' | 'default'> = {
      PAID: 'success',
      PENDING: 'processing',
      CANCELLED: 'error',
      FAILED: 'error',
    };
    return statusTypes[status] || 'default';
  }
}

export const transactionApi = new TransactionApiService();
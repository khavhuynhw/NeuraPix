import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PAYMENT_BASE_URL = `${BASE_URL}/api/v2/payments/payos`;
const TRANSACTION_BASE_URL = `${BASE_URL}/api/v1/transactions`;

// Types
export interface CreatePaymentLinkRequest {
  userId: number;
  productName: string;
  description?: string;
  price: number;
  buyerEmail?: string;
  subscriptionId?: number;
}

export interface PaymentLinkResponse {
  success: boolean;
  data: {
    orderCode: number;
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
  };
  orderCode: number;
}

export interface PaymentInfo {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  status: string;
}

export interface PaymentInfoResponse {
  success: boolean;
  data: PaymentInfo;
}

export interface Transaction {
  id: number;
  orderCode: number;
  userId: number;
  subscriptionId?: number;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'EXPIRED' | 'REFUNDED' | 'PROCESSING';
  type: 'SUBSCRIPTION_PAYMENT' | 'SUBSCRIPTION_RENEWAL' | 'SUBSCRIPTION_UPGRADE' | 'SUBSCRIPTION_DOWNGRADE' | 'ONE_TIME_PAYMENT' | 'REFUND';
  paymentProvider: string;
  description: string;
  buyerEmail?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CancelPaymentResponse {
  success: boolean;
  data: PaymentInfo;
}

class PaymentApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<PaymentLinkResponse> {
    try {
      console.log('Creating payment link with request:', request);
      const response = await axios.post(
        `${PAYMENT_BASE_URL}/create-payment-link`,
        request,
        {
          headers: this.getAuthHeaders(),
        }
      );

      console.log('Payment link response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Payment link creation error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to create payment link");
      }
      throw new Error("Failed to create payment link");
    }
  }

  async getPaymentInfo(orderCode: number): Promise<PaymentInfoResponse> {
    try {
      const response = await axios.get(
        `${PAYMENT_BASE_URL}/payment-info/${orderCode}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Get payment info error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get payment info");
      }
      throw new Error("Failed to get payment info");
    }
  }

  async cancelPayment(orderCode: number, reason?: string): Promise<CancelPaymentResponse> {
    try {
      const response = await axios.post(
        `${PAYMENT_BASE_URL}/cancel-payment/${orderCode}`,
        {},
        {
          params: { reason: reason || 'Payment cancelled by user' },
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Cancel payment error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to cancel payment");
      }
      throw new Error("Failed to cancel payment");
    }
  }

  async pollPaymentStatus(orderCode: number, maxAttempts: number = 60, intervalMs: number = 2000): Promise<PaymentInfoResponse> {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const paymentInfo = await this.getPaymentInfo(orderCode);
          
          // Check for terminal states
          if (paymentInfo.data.status === "PAID" || 
              paymentInfo.data.status === "CANCELLED" || 
              paymentInfo.data.status === "FAILED") {
            resolve(paymentInfo);
            return;
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error("Payment polling timeout"));
            return;
          }
          
          setTimeout(poll, intervalMs);
        } catch (error) {
          console.error(`Payment polling attempt ${attempts + 1} failed:`, error);
          attempts++;
          if (attempts >= maxAttempts) {
            reject(error);
            return;
          }
          setTimeout(poll, intervalMs);
        }
      };
      
      poll();
    });
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/user/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Get user transactions error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get transactions");
      }
      throw new Error("Failed to get transactions");
    }
  }

  /**
   * Get transaction by order code
   */
  async getTransaction(orderCode: number): Promise<Transaction> {
    try {
      const response = await axios.get(`${TRANSACTION_BASE_URL}/order/${orderCode}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Get transaction error:', error);
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get transaction");
      }
      throw new Error("Failed to get transaction");
    }
  }

  /**
   * Redirect user to PayOS payment page
   */
  redirectToPayment(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }

  /**
   * Open PayOS payment in new window/tab
   */
  openPaymentWindow(checkoutUrl: string): Window | null {
    const paymentWindow = window.open(
      checkoutUrl,
      'payos_payment',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );
    
    return paymentWindow;
  }
}

export const paymentApi = new PaymentApiService();
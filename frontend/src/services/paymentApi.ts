import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v2";

// Types
export interface CreatePaymentLinkRequest {
  userId: number;
  subscriptionId?: number;
  productName: string;
  description?: string;
  price: number;
  buyerEmail: string;
}

export interface CreatePaymentLinkResponse {
  success: boolean;
  data: {
    paymentLinkId: string;
    checkoutUrl: string;
    qrCode: string;
    amount: number;
    currency: string;
    description: string;
  };
  orderCode: number;
}

export interface PaymentInfoResponse {
  success: boolean;
  data: {
    id: string;
    orderCode: number;
    amount: number;
    amountPaid: number;
    amountRemaining: number;
    status: string;
    createdAt: string;
    transactions: any[];
  };
}

export interface CancelPaymentResponse {
  success: boolean;
  data: {
    id: string;
    orderCode: number;
    status: string;
    cancellationReason: string;
  };
}

class PaymentApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createPaymentLink(request: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    try {
      const response = await axios.post(
        `${BASE_URL}/payments/payos/create-payment-link`,
        request,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to create payment link");
      }
      throw new Error("Failed to create payment link");
    }
  }

  async getPaymentInfo(orderCode: number): Promise<PaymentInfoResponse> {
    try {
      const response = await axios.get(
        `${BASE_URL}/payments/payos/payment-info/${orderCode}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || "Failed to get payment info");
      }
      throw new Error("Failed to get payment info");
    }
  }

  async cancelPayment(orderCode: number, reason?: string): Promise<CancelPaymentResponse> {
    try {
      const response = await axios.post(
        `${BASE_URL}/payments/payos/cancel-payment/${orderCode}`,
        {},
        {
          params: { reason },
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: any) {
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
          
          if (paymentInfo.data.status === "PAID" || paymentInfo.data.status === "CANCELLED") {
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
          reject(error);
        }
      };
      
      poll();
    });
  }
}

export const paymentApi = new PaymentApiService();
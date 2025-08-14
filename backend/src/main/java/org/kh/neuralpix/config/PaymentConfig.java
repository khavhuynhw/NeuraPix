package org.kh.neuralpix.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.payment")
@Data
public class PaymentConfig {
    
    @Value("${app.webhook.base-url:http://localhost:8080}")
    private String webhookBaseUrl;
    
    /**
     * Frontend URLs for payment redirects
     */
    private Frontend frontend = new Frontend();
    
    /**
     * PayOS specific configuration
     */
    private PayOS payos = new PayOS();
    
    @Data
    public static class Frontend {
        private String baseUrl = "http://localhost:5173";
        private String subscriptionSuccessPath = "/subscription/success";
        private String subscriptionCancelPath = "/subscription/cancel";
        private String paymentSuccessPath = "/payment/success";
        private String paymentCancelPath = "/payment/cancel";
        private String paymentFailedPath = "/payment/failed";
        private String upgradeSuccessPath = "/upgrade/success";
        private String upgradeCancelPath = "/upgrade/cancel";
        private String homePath = "/";
        
        public String getSubscriptionSuccessUrl(Long orderCode) {
            return baseUrl + subscriptionSuccessPath + "?orderCode=" + orderCode;
        }
        
        public String getSubscriptionCancelUrl(Long orderCode) {
            return baseUrl + subscriptionCancelPath + "?orderCode=" + orderCode;
        }
        
        public String getPaymentSuccessUrl(Long orderCode) {
            return baseUrl + paymentSuccessPath + "?orderCode=" + orderCode;
        }
        
        public String getPaymentCancelUrl(Long orderCode) {
            return baseUrl + paymentCancelPath + "?orderCode=" + orderCode;
        }
        
        public String getPaymentFailedUrl(Long orderCode) {
            return baseUrl + paymentFailedPath + "?orderCode=" + orderCode;
        }
        
        public String getUpgradeSuccessUrl(Long orderCode) {
            return baseUrl + upgradeSuccessPath + "?orderCode=" + orderCode;
        }
        
        public String getUpgradeCancelUrl(Long orderCode) {
            return baseUrl + upgradeCancelPath + "?orderCode=" + orderCode;
        }
        
        public String getHomeUrl() {
            return baseUrl + homePath;
        }
    }
    
    /**
     * Get the configured webhook base URL
     */
    public String getWebhookBaseUrl() {
        return webhookBaseUrl;
    }
    
    /**
     * Get the full webhook URL
     */
    public String getWebhookUrl() {
        return webhookBaseUrl + "/api/v2/payments/payos/webhook";
    }
    
    @Data
    public static class PayOS {
        private String clientId;
        private String apiKey;
        private String checksumKey;
        private String returnUrl;
        private String cancelUrl;
        private boolean enableSignatureVerification = true;
        private int transactionTimeoutMinutes = 15;
    }
}
package org.kh.neuralpix.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.kh.neuralpix.service.PayOSPaymentService;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

import jakarta.annotation.PostConstruct;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicLong;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayOSPaymentServiceImpl implements PayOSPaymentService {

    private final TransactionService transactionService;
    
    // Atomic counter for thread-safe orderCode generation
    private static final AtomicLong orderCodeCounter = new AtomicLong(System.currentTimeMillis() / 1000);

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    private PayOS payOS;

    @Value("${app.webhook.base-url:http://localhost:8080}")
    private String webhookBaseUrl;
    
    @PostConstruct
    public void init() {
        try {
            this.payOS = new PayOS(clientId, apiKey, checksumKey);
            log.info("PayOS service initialized with client ID: {}", clientId);
        } catch (Exception e) {
            log.error("Failed to initialize PayOS service", e);
            throw new RuntimeException("PayOS initialization failed", e);
        }
    }
    

    @Override
    public CheckoutResponseData createPaymentLink(Long orderCode, BigDecimal amount, String description, String buyerEmail) {
        return createPaymentLinkWithTransaction(orderCode, null, null, amount, Transaction.TransactionType.ONE_TIME_PAYMENT, description, buyerEmail);
    }

    /**
     * Tạo payment link và lưu transaction với thread-safe orderCode generation
     */
    public CheckoutResponseData createPaymentLinkWithTransaction(Long orderCode, Long userId, Long subscriptionId, 
                                                               BigDecimal amount, Transaction.TransactionType type, 
                                                               String description, String buyerEmail) {
        try {
            // Validate inputs
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Amount must be greater than 0");
            }
            if (amount.intValue() < PayOSConstants.MIN_AMOUNT) {
                throw new IllegalArgumentException("Amount must be at least " + PayOSConstants.MIN_AMOUNT + " VND");
            }
            if (amount.intValue() > PayOSConstants.MAX_AMOUNT) {
                throw new IllegalArgumentException("Amount cannot exceed " + PayOSConstants.MAX_AMOUNT + " VND");
            }
            if (description == null || description.trim().isEmpty()) {
                throw new IllegalArgumentException("Description cannot be empty");
            }
            if (description.length() > PayOSConstants.MAX_DESCRIPTION_LENGTH) {
                throw new IllegalArgumentException("Description cannot exceed " + PayOSConstants.MAX_DESCRIPTION_LENGTH + " characters");
            }
            
            // Generate unique orderCode if not provided
            if (orderCode == null) {
                orderCode = generateUniqueOrderCode();
            }
            
            log.info("Creating payment link for order: {} with amount: {}", orderCode, amount);
            
            // Kiểm tra orderCode đã tồn tại chưa
            if (transactionService.existsByOrderCode(orderCode)) {
                throw new RuntimeException("Order code already exists: " + orderCode);
            }
            
            PaymentData.PaymentDataBuilder paymentDataBuilder = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValue())
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl);

            // Add buyer information if provided
            if (buyerEmail != null && !buyerEmail.trim().isEmpty() && isValidEmail(buyerEmail)) {
                paymentDataBuilder.buyerEmail(buyerEmail);
            }

            // Add default item
            ItemData item = ItemData.builder()
                    .name(description)
                    .quantity(1)
                    .price(amount.intValue())
                    .build();
            
            paymentDataBuilder.items(Collections.singletonList(item));

            PaymentData paymentData = paymentDataBuilder.build();
            
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);

            // Create transaction record only if userId is provided
            if (userId != null) {
                transactionService.createPayOSTransaction(
                    orderCode, 
                    userId, 
                    subscriptionId, 
                    amount, 
                    type, 
                    description, 
                    buyerEmail
                );
                log.info("Transaction saved for order: {}", orderCode);
            }
            
            log.info("Payment link created successfully for order: {}", orderCode);
            return response;
            
        } catch (Exception e) {
            log.error("Error creating payment link for order: {}", orderCode, e);
            throw new RuntimeException("Failed to create payment link: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentLinkData getPaymentLinkInfo(Long orderCode) {
        try {
            if (orderCode == null) {
                throw new IllegalArgumentException("Order code cannot be null");
            }
            
            log.info("Getting payment link info for order: {}", orderCode);
            PaymentLinkData paymentData = payOS.getPaymentLinkInformation(orderCode);
            log.info("Retrieved payment info for order: {}", orderCode);
            return paymentData;
        } catch (Exception e) {
            log.error("Error getting payment link info for order: {}", orderCode, e);
            throw new RuntimeException("Failed to get payment link info: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentLinkData cancelPaymentLink(Long orderCode, String reason) {
        try {
            if (orderCode == null) {
                throw new IllegalArgumentException("Order code cannot be null");
            }
            
            log.info("Cancelling payment link for order: {} with reason: {}", orderCode, reason);
            
            String cancellationReason = reason != null ? reason : "Payment cancelled by user";
            PaymentLinkData paymentData = payOS.cancelPaymentLink(orderCode, cancellationReason);
            
            // Cập nhật transaction status
            try {
                transactionService.markTransactionAsCancelled(orderCode);
                log.info("Transaction marked as cancelled for order: {}", orderCode);
            } catch (Exception e) {
                log.warn("Failed to update transaction status for order: {}", orderCode, e);
                // Không throw exception vì PayOS đã cancel thành công
            }
            
            log.info("Payment link cancelled for order: {}", orderCode);
            return paymentData;
        } catch (Exception e) {
            log.error("Error cancelling payment link for order: {}", orderCode, e);
            throw new RuntimeException("Failed to cancel payment link: " + e.getMessage(), e);
        }
    }

    @Override
    public WebhookData verifyWebhookData(Webhook webhookData) {
        try {
            if (webhookData == null) {
                throw new IllegalArgumentException("Webhook data cannot be null");
            }
            
            if (webhookData.getData() == null) {
                throw new IllegalArgumentException("Webhook data content cannot be null");
            }
            
            log.info("Verifying webhook data for order: {}", webhookData.getData().getOrderCode());
            
            // For PayOS, we'll use their built-in verification instead of custom signature verification
            // This is more reliable than implementing our own signature logic
            WebhookData verifiedData = payOS.verifyPaymentWebhookData(webhookData);
            
            if (verifiedData == null || verifiedData.getOrderCode() == null) {
                throw new SecurityException("Invalid webhook data after verification");
            }
            
            log.info("Webhook data verified successfully for order: {}", verifiedData.getOrderCode());
            return verifiedData;
        } catch (Exception e) {
            log.error("Error verifying webhook data", e);
            throw new RuntimeException("Failed to verify webhook data: " + e.getMessage(), e);
        }
    }

    @Override
    public void confirmWebhook(String webhookUrl) {
        try {
            if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
                throw new IllegalArgumentException("Webhook URL cannot be empty");
            }
            
            log.info("Confirming webhook URL: {}", webhookUrl);
            payOS.confirmWebhook(webhookUrl);
            log.info("Webhook confirmed successfully");
        } catch (Exception e) {
            log.error("Error confirming webhook URL: {}", webhookUrl, e);
            throw new RuntimeException("Failed to confirm webhook: " + e.getMessage(), e);
        }
    }

    /**
     * Generate thread-safe unique order code
     */
    public Long generateUniqueOrderCode() {
        return orderCodeCounter.incrementAndGet();
    }

    /**
     * Verify webhook signature for security - Backup method if needed
     * Note: PayOS SDK's verifyPaymentWebhookData should be used primarily
     */
    private boolean verifyWebhookSignature(Webhook webhookData) {
        try {
            if (webhookData == null || webhookData.getData() == null) {
                log.warn("Webhook data or signature is null");
                return false;
            }
            
            if (webhookData.getSignature() == null || checksumKey == null) {
                log.warn("Missing signature or checksum key for webhook verification");
                return false;
            }
            
            // Create signature from webhook data according to PayOS documentation
            String dataToSign = createSignatureData(webhookData);
            String expectedSignature = createHmacSha256(dataToSign, checksumKey);
            
            boolean isValid = expectedSignature.equals(webhookData.getSignature());
            if (!isValid) {
                log.warn("Webhook signature verification failed. Expected: {}, Received: {}", 
                    expectedSignature, webhookData.getSignature());
            }
            
            return isValid;
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Create signature data string from webhook according to PayOS format
     */
    private String createSignatureData(Webhook webhookData) {
        if (webhookData == null || webhookData.getData() == null) {
            throw new IllegalArgumentException("Webhook data cannot be null for signature creation");
        }
        
        // PayOS signature format: orderCode + amount + description + returnUrl + cancelUrl
        // Adjust this based on actual PayOS documentation
        return String.format("%s%s%s", 
            webhookData.getData().getOrderCode() != null ? webhookData.getData().getOrderCode() : "",
            webhookData.getData().getAmount() != null ? webhookData.getData().getAmount() : "",
            webhookData.getData().getCode() != null ? webhookData.getData().getCode() : "");
    }

    /**
     * Create HMAC SHA256 signature
     */
    private String createHmacSha256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        if (data == null || key == null) {
            throw new IllegalArgumentException("Data and key cannot be null for HMAC generation");
        }
        
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder result = new StringBuilder();
        for (byte b : hash) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
}
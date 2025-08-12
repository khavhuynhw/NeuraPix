package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.config.PaymentConfig;
import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.dto.payos.CreatePaymentLinkRequestBody;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.kh.neuralpix.service.SubscriptionService;
import org.kh.neuralpix.service.TransactionService;
import org.kh.neuralpix.service.impl.PayOSPaymentServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/payments/payos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
public class PayOSPaymentController {

    private final PayOSPaymentService payOSPaymentService;
    private final PayOSPaymentServiceImpl payOSPaymentServiceImpl;
    private final TransactionService transactionService;
    private final SubscriptionService subscriptionService;
    private final PaymentConfig paymentConfig;

    @PostMapping("/create-payment-link")
    public ResponseEntity<Map<String, Object>> createPaymentLink(@Valid @RequestBody CreatePaymentLinkRequestDto request) {
        try {
            log.info("Creating PayOS payment link for user: {} - product: {}", 
                request.getUserId(), request.getProductName());

            // Validate request
            validateCreatePaymentRequest(request);

            Transaction.TransactionType transactionType = request.getSubscriptionId() != null 
                ? Transaction.TransactionType.SUBSCRIPTION_PAYMENT 
                : Transaction.TransactionType.ONE_TIME_PAYMENT;

            CheckoutResponseData response = payOSPaymentServiceImpl.createPaymentLinkWithTransaction(
                    null, // Let service generate orderCode
                    request.getUserId(),
                    request.getSubscriptionId(),
                    BigDecimal.valueOf(request.getPrice()),
                    transactionType,
                    request.getDescription() != null ? request.getDescription() : request.getProductName(),
                    request.getBuyerEmail()
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("orderCode", response.getOrderCode());

            log.info("Payment link created successfully for order: {}", response.getOrderCode());
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for payment link creation: {}", e.getMessage());
            return createErrorResponse("Invalid request: " + e.getMessage(), 400);
        } catch (Exception e) {
            log.error("Error creating PayOS payment link", e);
            return createErrorResponse("Failed to create payment link: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/payment-info/{orderCode}")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(@PathVariable @NotNull Long orderCode) {
        try {
            log.info("Getting PayOS payment info for order: {}", orderCode);
            
            PaymentLinkData paymentInfo = payOSPaymentService.getPaymentLinkInfo(orderCode);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", paymentInfo);

            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid order code: {}", orderCode);
            return createErrorResponse("Invalid order code", 400);
        } catch (Exception e) {
            log.error("Error getting PayOS payment info for order: {}", orderCode, e);
            return createErrorResponse("Failed to get payment info: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/cancel-payment/{orderCode}")
    public ResponseEntity<Map<String, Object>> cancelPayment(@PathVariable @NotNull Long orderCode, 
                                                           @RequestParam(required = false) String reason) {
        try {
            log.info("Cancelling PayOS payment for order: {}", orderCode);
            
            String cancellationReason = reason != null && !reason.trim().isEmpty() 
                ? reason : "Payment cancelled by user";
            PaymentLinkData paymentInfo = payOSPaymentService.cancelPaymentLink(orderCode, cancellationReason);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", paymentInfo);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error cancelling PayOS payment for order: {}", orderCode, e);
            return createErrorResponse("Failed to cancel payment: " + e.getMessage(), 500);
        }
    }
    
    @GetMapping("/cancel")
    public ResponseEntity<String> handlePaymentCancel(@RequestParam @NotNull Long orderCode) {
        try {
            log.info("Handling PayOS payment cancellation for order: {}", orderCode);
            
            // Mark transaction as cancelled if exists
            try {
                transactionService.markTransactionAsCancelled(orderCode);
                log.info("Transaction marked as cancelled for order: {}", orderCode);
            } catch (Exception e) {
                log.warn("Could not mark transaction as cancelled for order: {}", orderCode, e);
            }
            
            // Determine redirect URL based on transaction type
            String redirectUrl = determineRedirectUrlForCancel(orderCode);
            
            return createRedirectResponse(redirectUrl, "Payment Cancelled", 
                "Payment cancelled... Redirecting...");
                
        } catch (Exception e) {
            log.error("Error handling PayOS payment cancellation for order: {}", orderCode, e);
            return createErrorRedirectResponse();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(@RequestBody Webhook webhookData) {
        try {
            log.info("Received PayOS webhook for order: {}", 
                webhookData.getData() != null ? webhookData.getData().getOrderCode() : "unknown");
            
            WebhookData verifiedData = payOSPaymentService.verifyWebhookData(webhookData);
            Long orderCode = verifiedData.getOrderCode();
            String statusCode = verifiedData.getCode();
            
            // Find transaction by order code
            Transaction transaction = transactionService.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Transaction not found for order code: " + orderCode));
            
            log.info("Processing webhook for transaction ID: {} with status: {}", 
                transaction.getId(), statusCode);
            
            // Process based on payment status using constants
            if (PayOSConstants.PAYMENT_SUCCESS.equals(statusCode)) {
                handleSuccessfulPayment(transaction, orderCode);
            } else if (PayOSConstants.PAYMENT_CANCELLED.equals(statusCode)) {
                handleCancelledPayment(orderCode);
            } else {
                handleFailedPayment(orderCode, statusCode);
            }
            
            log.info("PayOS webhook processed successfully for order: {}", orderCode);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.error("Security error processing PayOS webhook: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Unauthorized webhook");
            return ResponseEntity.status(401).body(error);
        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to process webhook: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> handlePaymentReturn(@RequestParam @NotNull Long orderCode, 
                                                     @RequestParam(required = false) String status) {
        try {
            log.info("Handling PayOS payment return for order: {} with status: {}", orderCode, status);
            
            // Get payment info to verify status with fallback
            PaymentLinkData paymentInfo = null;
            try {
                paymentInfo = payOSPaymentService.getPaymentLinkInfo(orderCode);
            } catch (Exception e) {
                log.warn("Could not get payment info for order: {}, using transaction status", orderCode);
            }
            
            // Find transaction
            Transaction transaction = transactionService.findByOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Transaction not found for order code: " + orderCode));
            
            String redirectUrl = determineRedirectUrl(paymentInfo, transaction, orderCode);
            
            return createRedirectResponse(redirectUrl, "Processing Payment...", 
                "Processing your payment... Please wait.");
                
        } catch (Exception e) {
            log.error("Error handling PayOS payment return for order: {}", orderCode, e);
            return createErrorRedirectResponse();
        }
    }

    @PostMapping("/confirm-webhook")
    public ResponseEntity<Map<String, String>> confirmWebhook(@RequestParam String webhookUrl) {
        try {
            if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
                throw new IllegalArgumentException("Webhook URL cannot be empty");
            }
            
            log.info("Confirming PayOS webhook URL: {}", webhookUrl);
            
            payOSPaymentService.confirmWebhook(webhookUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook URL confirmed successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid webhook URL: {}", webhookUrl);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Invalid webhook URL");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Error confirming PayOS webhook URL: {}", webhookUrl, e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to confirm webhook URL: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // ===== PRIVATE HELPER METHODS =====

    private void validateCreatePaymentRequest(CreatePaymentLinkRequestDto request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (request.getPrice() < PayOSConstants.MIN_AMOUNT) {
            throw new IllegalArgumentException("Amount must be at least " + PayOSConstants.MIN_AMOUNT + " VND");
        }
        if (request.getPrice() > PayOSConstants.MAX_AMOUNT) {
            throw new IllegalArgumentException("Amount cannot exceed " + PayOSConstants.MAX_AMOUNT + " VND");
        }
        if (request.getProductName() == null || request.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (request.getBuyerEmail() != null && !isValidEmail(request.getBuyerEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    private void handleSuccessfulPayment(Transaction transaction, Long orderCode) {
        // Update transaction status
        transaction = transactionService.markTransactionAsPaid(orderCode, PayOSConstants.DEFAULT_PAYMENT_PROVIDER);
        
        // If this is a subscription payment, activate the subscription
        if (transaction.getSubscriptionId() != null && 
            transaction.getType() == Transaction.TransactionType.SUBSCRIPTION_PAYMENT) {
            
            log.info("Activating subscription: {}", transaction.getSubscriptionId());
            subscriptionService.activateSubscription(transaction.getSubscriptionId());
        }
        
        log.info("PayOS payment successful for order: {}", orderCode);
    }

    private void handleCancelledPayment(Long orderCode) {
        transactionService.markTransactionAsCancelled(orderCode);
        log.info("PayOS payment cancelled for order: {}", orderCode);
    }

    private void handleFailedPayment(Long orderCode, String statusCode) {
        transactionService.markTransactionAsFailed(orderCode);
        log.warn("PayOS payment failed for order: {} with status: {}", orderCode, statusCode);
    }

    private String determineRedirectUrl(PaymentLinkData paymentInfo, Transaction transaction, Long orderCode) {
        String paymentStatus = paymentInfo != null ? paymentInfo.getStatus() : null;
        
        if (PayOSConstants.STATUS_PAID.equals(paymentStatus) || transaction.isPaid()) {
            if (transaction.getSubscriptionId() != null) {
                return paymentConfig.getFrontend().getSubscriptionSuccessUrl(orderCode);
            } else {
                return paymentConfig.getFrontend().getPaymentSuccessUrl(orderCode);
            }
        } else if (PayOSConstants.STATUS_CANCELLED.equals(paymentStatus) || transaction.isCancelled()) {
            return paymentConfig.getFrontend().getPaymentCancelUrl(orderCode);
        } else {
            return paymentConfig.getFrontend().getPaymentFailedUrl(orderCode);
        }
    }

    private String determineRedirectUrlForCancel(Long orderCode) {
        try {
            Transaction transaction = transactionService.findByOrderCode(orderCode).orElse(null);
            if (transaction != null && transaction.getSubscriptionId() != null) {
                return paymentConfig.getFrontend().getSubscriptionCancelUrl(orderCode);
            }
        } catch (Exception e) {
            log.warn("Could not determine transaction type for order: {}", orderCode);
        }
        return paymentConfig.getFrontend().getPaymentCancelUrl(orderCode);
    }

    private ResponseEntity<String> createRedirectResponse(String redirectUrl, String title, String message) {
        String html = "<!DOCTYPE html>\\n" +
                "<html>\\n" +
                "<head>\\n" +
                "    <meta charset='UTF-8'>\\n" +
                "    <title>" + title + "</title>\\n" +
                "    <script>\\n" +
                "        window.location.href = '" + redirectUrl + "';\\n" +
                "    </script>\\n" +
                "</head>\\n" +
                "<body>\\n" +
                "    <p>" + message + "</p>\\n" +
                "    <p>If you are not redirected automatically, <a href='" + redirectUrl + "'>click here</a>.</p>\\n" +
                "</body>\\n" +
                "</html>";
        
        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(html);
    }

    private ResponseEntity<String> createErrorRedirectResponse() {
        String errorHtml = "<!DOCTYPE html>\\n" +
                "<html>\\n" +
                "<head>\\n" +
                "    <meta charset='UTF-8'>\\n" +
                "    <title>Payment Error</title>\\n" +
                "</head>\\n" +
                "<body>\\n" +
                "    <h1>Payment Processing Error</h1>\\n" +
                "    <p>An error occurred while processing your payment. Please contact support.</p>\\n" +
                "    <p><a href='" + paymentConfig.getFrontend().getHomeUrl() + "'>Return to Home</a></p>\\n" +
                "</body>\\n" +
                "</html>";
        
        return ResponseEntity.internalServerError()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(errorHtml);
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(String message, int statusCode) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        
        if (statusCode == 400) {
            return ResponseEntity.badRequest().body(error);
        } else {
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    // ===== INNER DTO CLASS =====
    
    public static class CreatePaymentLinkRequestDto {
        @NotNull(message = "User ID is required")
        private Long userId;
        
        @NotNull(message = "Product name is required")
        private String productName;
        
        private String description;
        private String returnUrl;
        
        @Min(value = PayOSConstants.MIN_AMOUNT, message = "Amount must be at least " + PayOSConstants.MIN_AMOUNT)
        private int price;
        
        private String cancelUrl;
        
        @Email(message = "Invalid email format")
        private String buyerEmail;
        
        private Long subscriptionId;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getReturnUrl() { return returnUrl; }
        public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }
        
        public int getPrice() { return price; }
        public void setPrice(int price) { this.price = price; }
        
        public String getCancelUrl() { return cancelUrl; }
        public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }
        
        public String getBuyerEmail() { return buyerEmail; }
        public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
        
        public Long getSubscriptionId() { return subscriptionId; }
        public void setSubscriptionId(Long subscriptionId) { this.subscriptionId = subscriptionId; }
    }
}
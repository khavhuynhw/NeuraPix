package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.config.PaymentConfig;
import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.dto.UserDto;
import org.kh.neuralpix.dto.payos.CreatePaymentLinkRequestDto;
import org.kh.neuralpix.dto.payos.CreateUpgradePaymentLinkRequestDto;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.service.EmailService;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.kh.neuralpix.service.SubscriptionService;
import org.kh.neuralpix.service.TransactionService;
import org.kh.neuralpix.service.UserService;
import org.kh.neuralpix.service.impl.PayOSPaymentServiceImpl;
import org.kh.neuralpix.utils.PaymentResponseUtil;
import org.kh.neuralpix.utils.PaymentStatusUtil;
import org.kh.neuralpix.utils.PaymentValidationUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/payments/payos")
@RequiredArgsConstructor
@Slf4j
public class PayOSPaymentController {

    private final PayOSPaymentService payOSPaymentService;
    private final PayOSPaymentServiceImpl payOSPaymentServiceImpl;
    private final TransactionService transactionService;
    private final SubscriptionService subscriptionService;
    private final PaymentConfig paymentConfig;
    private final UserService userService;
    private final EmailService emailService;

    @PostMapping("/create-payment-link")
    public ResponseEntity<Map<String, Object>> createPaymentLink(@Valid @RequestBody CreatePaymentLinkRequestDto request) {
        try {
            log.info("Creating PayOS payment link for user: {} - product: {}", 
                request.getUserId(), request.getProductName());

            PaymentValidationUtil.validateCreatePaymentRequest(request);

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

            Map<String, Object> additionalFields = new HashMap<>();
            additionalFields.put("orderCode", response.getOrderCode());

            log.info("Payment link created successfully for order: {}", response.getOrderCode());
            return PaymentResponseUtil.createSuccessResponse(response, additionalFields);
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for payment link creation: {}", e.getMessage());
            return PaymentResponseUtil.createErrorResponse("Invalid request: " + e.getMessage(), 400);
        } catch (Exception e) {
            log.error("Error creating PayOS payment link", e);
            return PaymentResponseUtil.createErrorResponse("Failed to create payment link: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> handlePaymentReturn(@RequestParam @NotNull Long orderCode, 
                                                     @RequestParam(required = false) String status,
                                                     @RequestParam(required = false) String code,
                                                     @RequestParam(required = false) String id,
                                                     @RequestParam(required = false) String cancel) {
        try {
            log.info("User returned from PayOS for order: {} with status: {}, code: {}, id: {}, cancel: {}", 
                orderCode, status, code, id, cancel);
            
            PaymentValidationUtil.validateOrderCode(orderCode);

            Optional<Transaction> transactionOpt = transactionService.findByOrderCode(orderCode);
            if (transactionOpt.isEmpty()) {
                log.error("Transaction not found for order code: {}", orderCode);
                return PaymentResponseUtil.createErrorRedirectResponse("Transaction not found", 
                    paymentConfig.getFrontend().getHomeUrl());
            }
            
            Transaction transaction = transactionOpt.get();
            log.info("Found transaction ID: {} with current status: {} for order: {}", 
                transaction.getId(), transaction.getStatus(), orderCode);

            // Use PayOS code and status to determine success
            String paymentStatus = determinePaymentStatusFromParams(code, status, cancel);
            String redirectUrl = determineRedirectUrlBasedOnTransactionStatus(transaction, orderCode, paymentStatus);
            
            log.info("Redirecting user to: {} for order: {}", redirectUrl, orderCode);
            return PaymentResponseUtil.createRedirectResponse(redirectUrl, "Processing Payment", 
                "Processing your payment result... Please wait.");
                
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for payment return: {}", e.getMessage());
            return PaymentResponseUtil.createErrorRedirectResponse("Invalid request: " + e.getMessage(), 
                paymentConfig.getFrontend().getHomeUrl());
        } catch (Exception e) {
            log.error("Error handling PayOS payment return for order: {}", orderCode, e);
            return PaymentResponseUtil.createErrorRedirectResponse("Payment processing failed", 
                paymentConfig.getFrontend().getHomeUrl());
        }
    }

    @GetMapping("/cancel")
    public ResponseEntity<String> handlePaymentCancel(@RequestParam @NotNull Long orderCode) {
        try {
            log.info("Handling PayOS payment cancellation for order: {}", orderCode);
            
            PaymentValidationUtil.validateOrderCode(orderCode);

            String redirectUrl = determineRedirectUrlForCancel(orderCode);
            
            return PaymentResponseUtil.createRedirectResponse(redirectUrl, "Payment Cancelled", 
                "Payment cancelled... Redirecting...");
                
        } catch (IllegalArgumentException e) {
            log.warn("Invalid order code for cancellation: {}", e.getMessage());
            return PaymentResponseUtil.createErrorRedirectResponse("Invalid request", 
                paymentConfig.getFrontend().getHomeUrl());
        } catch (Exception e) {
            log.error("Error handling PayOS payment cancellation for order: {}", orderCode, e);
            return PaymentResponseUtil.createErrorRedirectResponse(paymentConfig.getFrontend().getHomeUrl());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(@RequestBody Webhook webhookData) {
        String orderCode = "unknown";
        try {
            if (webhookData == null || webhookData.getData() == null) {
                log.error("Received invalid webhook data");
                return PaymentResponseUtil.createWebhookErrorResponse("Invalid webhook data", 400);
            }

            orderCode = String.valueOf(webhookData.getData().getOrderCode());
            log.info("Received PayOS webhook for order: {}", orderCode);

            WebhookData verifiedData = payOSPaymentService.verifyWebhookData(webhookData);
            Long orderCodeLong = verifiedData.getOrderCode();
            String statusCode = verifiedData.getCode();

            log.info("Webhook verified for order: {} with status code: {}", orderCodeLong, statusCode);

            Optional<Transaction> transactionOpt = transactionService.findByOrderCode(orderCodeLong);
            if (transactionOpt.isEmpty()) {
                log.error("Transaction not found for order code: {}", orderCodeLong);
                return PaymentResponseUtil.createWebhookErrorResponse("Transaction not found", 404);
            }

            Transaction transaction = transactionOpt.get();
            log.info("Processing webhook for transaction ID: {} with current status: {} and webhook status: {}",
                transaction.getId(), transaction.getStatus(), statusCode);

            processPaymentWebhook(transaction, statusCode, orderCodeLong);

            log.info("PayOS webhook processed successfully for order: {}", orderCodeLong);
            return PaymentResponseUtil.createWebhookSuccessResponse("Webhook processed successfully");

        } catch (SecurityException e) {
            log.error("Security error processing PayOS webhook for order: {}", orderCode, e);
            return PaymentResponseUtil.createWebhookErrorResponse("Unauthorized webhook", 401);
        } catch (Exception e) {
            log.error("Error processing PayOS webhook for order: {}", orderCode, e);
            // Return success để tránh PayOS retry, nhưng log error để manual review
            return PaymentResponseUtil.createWebhookAcceptedResponse("Webhook received but processing failed - manual review required");
        }
    }

    @GetMapping("/payment-info/{orderCode}")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(@PathVariable @NotNull Long orderCode) {
        try {
            log.info("Getting PayOS payment info for order: {}", orderCode);
            
            PaymentValidationUtil.validateOrderCode(orderCode);
            PaymentLinkData paymentInfo = payOSPaymentService.getPaymentLinkInfo(orderCode);
            
            return PaymentResponseUtil.createSuccessResponse(paymentInfo);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid order code: {}", orderCode);
            return PaymentResponseUtil.createErrorResponse("Invalid order code", 400);
        } catch (Exception e) {
            log.error("Error getting PayOS payment info for order: {}", orderCode, e);
            return PaymentResponseUtil.createErrorResponse("Failed to get payment info: " + e.getMessage(), 500);
        }
    }

//    @PostMapping("/webhook")
//    public ResponseEntity<String> handleWebhook(){
//        return ResponseEntity.ok("Webhook endpoint is active. Please send a POST request with valid data.");
//    }

    @PostMapping("/cancel-payment/{orderCode}")
    public ResponseEntity<Map<String, Object>> cancelPayment(@PathVariable @NotNull Long orderCode,
                                                           @RequestParam(required = false) String reason) {
        try {
            log.info("Cancelling PayOS payment for order: {}", orderCode);

            PaymentValidationUtil.validateOrderCode(orderCode);

            String cancellationReason = reason != null && !reason.trim().isEmpty()
                ? reason : "Payment cancelled by user";
            PaymentLinkData paymentInfo = payOSPaymentService.cancelPaymentLink(orderCode, cancellationReason);

            return PaymentResponseUtil.createSuccessResponse(paymentInfo);
        } catch (Exception e) {
            log.error("Error cancelling PayOS payment for order: {}", orderCode, e);
            return PaymentResponseUtil.createErrorResponse("Failed to cancel payment: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/create-upgrade-payment")
    public ResponseEntity<Map<String, Object>> createUpgradePaymentLink(@Valid @RequestBody CreateUpgradePaymentLinkRequestDto request) {
        try {
            log.info("Creating PayOS upgrade payment link for user: {} - upgrade from {} to {}", 
                request.getUserId(), request.getCurrentTier(), request.getNewTier());

            PaymentValidationUtil.validateUpgradePaymentRequest(request);

            // Generate unique order code for upgrade payment
            Long orderCode = System.currentTimeMillis() / 1000;
            
            // Create product name for upgrade
            String productName = String.format("Subscription Upgrade - %s to %s", 
                request.getCurrentTier().name(), request.getNewTier().name());
            
            // Enhanced description with upgrade details
            String description = request.getDescription() != null ? request.getDescription() : 
                String.format("Upgrade subscription from %s to %s plan", 
                    request.getCurrentTier().name(), request.getNewTier().name());

            // Set return URLs specifically for upgrade payments
            String returnUrl = request.getReturnUrl() != null ? request.getReturnUrl() : 
                paymentConfig.getFrontend().getUpgradeSuccessUrl(orderCode);
                
            String cancelUrl = request.getCancelUrl() != null ? request.getCancelUrl() : 
                paymentConfig.getFrontend().getUpgradeCancelUrl(orderCode);

            // Create PayOS payment link
            CheckoutResponseData paymentResponse = payOSPaymentService.createPaymentLink(
                orderCode,
                new BigDecimal(request.getUpgradeAmount()),
                description,
                request.getBuyerEmail()
            );

            if (paymentResponse == null) {
                log.error("PayOS service returned null response for upgrade payment");
                return PaymentResponseUtil.createErrorResponse("Failed to create upgrade payment link", 500);
            }

            // Create transaction record for upgrade payment
            Transaction upgradeTransaction = Transaction.builder()
                .orderCode(orderCode)
                .userId(request.getUserId())
                .subscriptionId(request.getSubscriptionId())
                .amount(new BigDecimal(request.getUpgradeAmount()))
                .currency("VND")
                .status(Transaction.TransactionStatus.PENDING)
                .type(Transaction.TransactionType.SUBSCRIPTION_UPGRADE)
                .paymentProvider("payos")
                .description(description)
                .buyerEmail(request.getBuyerEmail())
                .build();

            upgradeTransaction = transactionService.createTransaction(upgradeTransaction);

            log.info("Created upgrade transaction: {} for order: {} with amount: {}", 
                upgradeTransaction.getId(), orderCode, request.getUpgradeAmount());

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Upgrade payment link created successfully");
            response.put("orderCode", orderCode);
            response.put("paymentLinkId", paymentResponse.getPaymentLinkId());
            response.put("checkoutUrl", paymentResponse.getCheckoutUrl());
            response.put("qrCode", paymentResponse.getQrCode());
            response.put("amount", request.getUpgradeAmount());
            response.put("currency", "VND");
            response.put("description", description);
            response.put("status", "PENDING");
            response.put("transactionId", upgradeTransaction.getId());
            response.put("upgradeDetails", Map.of(
                "currentTier", request.getCurrentTier().name(),
                "newTier", request.getNewTier().name(),
                "subscriptionId", request.getSubscriptionId()
            ));

            log.info("Upgrade payment link created successfully for order: {} with checkout URL: {}", 
                orderCode, paymentResponse.getCheckoutUrl());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid upgrade payment request: {}", e.getMessage());
            return PaymentResponseUtil.createErrorResponse("Invalid request: " + e.getMessage(), 400);
        } catch (Exception e) {
            log.error("Error creating upgrade payment link for user: {}", request.getUserId(), e);
            return PaymentResponseUtil.createErrorResponse("Failed to create upgrade payment link: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/confirm-webhook")
    public ResponseEntity<Map<String, String>> confirmWebhook(@RequestParam String webhookUrl) {
        try {
            PaymentValidationUtil.validateWebhookUrl(webhookUrl);
            
            log.info("Confirming PayOS webhook URL: {}", webhookUrl);
            payOSPaymentService.confirmWebhook(webhookUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook URL confirmed successfully");
            response.put("webhookUrl", webhookUrl);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid webhook URL: {}", webhookUrl);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Invalid webhook URL: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Error confirming PayOS webhook URL: {}", webhookUrl, e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to confirm webhook URL: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }


    private void processPaymentWebhook(Transaction transaction, String statusCode, Long orderCode) {
        try {
            log.info("Processing payment webhook for transaction: {} with PayOS status code: {}", 
                transaction.getId(), statusCode);

            if (PayOSConstants.PAYMENT_SUCCESS.equals(statusCode)) {
                handleSuccessfulPaymentWebhook(transaction, orderCode);
            } else if (PayOSConstants.PAYMENT_CANCELLED.equals(statusCode)) {
                handleCancelledPaymentWebhook(transaction, orderCode);
            } else if (PayOSConstants.PAYMENT_FAILED.equals(statusCode)) {
                handleFailedPaymentWebhook(transaction, orderCode);
            } else if (PayOSConstants.PAYMENT_PENDING.equals(statusCode)) {
                handlePendingPaymentWebhook(transaction, orderCode);
            } else {
                log.warn("Unknown PayOS status code: {} for order: {}, treating as failed", statusCode, orderCode);
                handleFailedPaymentWebhook(transaction, orderCode);
            }
        } catch (Exception e) {
            log.error("Error processing payment webhook for order: {}", orderCode, e);
            throw e;
        }
    }

    private void handleSuccessfulPaymentWebhook(Transaction transaction, Long orderCode) {
        try {
            log.info("Processing successful payment webhook for order: {} with transaction ID: {}", 
                orderCode, transaction.getId());

            if (transaction.isPaid()) {
                log.info("Transaction {} is already marked as paid, skipping processing", transaction.getId());
                return;
            }

            transaction = transactionService.markTransactionAsPaid(orderCode, PayOSConstants.DEFAULT_PAYMENT_PROVIDER);
            log.info("Transaction {} marked as paid successfully", transaction.getId());

            if (transaction.getSubscriptionId() != null) {
                if (transaction.getType() == Transaction.TransactionType.SUBSCRIPTION_PAYMENT) {
                    log.info("Activating subscription: {} for transaction: {}", 
                        transaction.getSubscriptionId(), transaction.getId());
                    
                    try {
                        subscriptionService.activateSubscription(transaction.getSubscriptionId());
                        log.info("Subscription {} activated successfully", transaction.getSubscriptionId());
                    } catch (Exception e) {
                        log.error("Failed to activate subscription {} for paid transaction {}. Manual intervention may be required.", 
                            transaction.getSubscriptionId(), transaction.getId(), e);
                    }
                } else if (transaction.getType() == Transaction.TransactionType.SUBSCRIPTION_UPGRADE) {
                    log.info("Processing subscription upgrade: {} for transaction: {}", 
                        transaction.getSubscriptionId(), transaction.getId());
                    
                    try {
                        processUpgradePaymentConfirmation(transaction);
                        log.info("Subscription upgrade {} processed successfully", transaction.getSubscriptionId());
                    } catch (Exception e) {
                        log.error("Failed to process subscription upgrade {} for paid transaction {}. Manual intervention may be required.", 
                            transaction.getSubscriptionId(), transaction.getId(), e);
                    }
                }
            }

            sendPaymentSuccessEmail(transaction);
            
            log.info("Successful payment webhook processing completed for order: {}", orderCode);
            
        } catch (IllegalStateException e) {
            log.warn("Transaction {} is already in final state: {}", orderCode, e.getMessage());
            // Không cần fail webhook nếu transaction đã được xử lý
        } catch (Exception e) {
            log.error("Error processing successful payment webhook for order: {}", orderCode, e);
            throw e;
        }
    }

    private void handleCancelledPaymentWebhook(Transaction transaction, Long orderCode) {
        try {
            log.info("Processing cancelled payment webhook for order: {}", orderCode);
            
            if (transaction.isCancelled()) {
                log.info("Transaction {} is already cancelled", transaction.getId());
                return;
            }
            
            transactionService.markTransactionAsCancelled(orderCode);
            log.info("Transaction {} marked as cancelled", transaction.getId());
            
        } catch (IllegalStateException e) {
            log.warn("Transaction {} is already in final state: {}", orderCode, e.getMessage());
        } catch (Exception e) {
            log.error("Error processing cancelled payment webhook for order: {}", orderCode, e);
            throw e;
        }
    }

    private void handleFailedPaymentWebhook(Transaction transaction, Long orderCode) {
        try {
            log.info("Processing failed payment webhook for order: {}", orderCode);
            
            if (transaction.isFailed()) {
                log.info("Transaction {} is already marked as failed", transaction.getId());
                return;
            }
            
            transactionService.markTransactionAsFailed(orderCode);
            log.info("Transaction {} marked as failed", transaction.getId());
            
        } catch (IllegalStateException e) {
            log.warn("Transaction {} is already in final state: {}", orderCode, e.getMessage());
        } catch (Exception e) {
            log.error("Error processing failed payment webhook for order: {}", orderCode, e);
            throw e;
        }
    }


    private void handlePendingPaymentWebhook(Transaction transaction, Long orderCode) {
        try {
            log.info("Processing pending payment webhook for order: {}", orderCode);
            
            // Transaction đã ở trạng thái PENDING từ khi tạo, không cần cập nhật gì
            log.info("Transaction {} remains in pending status", transaction.getId());
            
        } catch (Exception e) {
            log.error("Error processing pending payment webhook for order: {}", orderCode, e);
            throw e;
        }
    }

    private String determinePaymentStatusFromParams(String code, String status, String cancel) {
        // PayOS uses code=00 for success, and cancel=false for successful payments
        if (code != null && "00".equals(code.trim()) && "false".equals(cancel)) {
            return "success";
        } else if (code != null && !"00".equals(code.trim())) {
            return "failed";
        } else if ("true".equals(cancel)) {
            return "cancel";
        } else if (status != null) {
            return status.toLowerCase();
        }
        return "unknown";
    }

    private String determineRedirectUrlBasedOnTransactionStatus(Transaction transaction, Long orderCode, String urlStatus) {

        if (transaction.isPaid()) {
            if (transaction.getSubscriptionId() != null) {
                return paymentConfig.getFrontend().getSubscriptionSuccessUrl(orderCode);
            } else {
                return paymentConfig.getFrontend().getPaymentSuccessUrl(orderCode);
            }
        } 

        else if (transaction.isCancelled()) {
            return paymentConfig.getFrontend().getPaymentCancelUrl(orderCode);
        } 

        else if (transaction.isFailed()) {
            return paymentConfig.getFrontend().getPaymentFailedUrl(orderCode);
        } 

        else {

            if (urlStatus != null) {
                String status = urlStatus.toLowerCase().trim();
                if (status.contains("success") || status.contains("paid")) {
                    // Check if this is a subscription payment even if not processed yet
                    if (transaction.getSubscriptionId() != null) {
                        return paymentConfig.getFrontend().getSubscriptionSuccessUrl(orderCode);
                    } else {
                        return paymentConfig.getFrontend().getPaymentSuccessUrl(orderCode) + "&pending=true";
                    }
                } else if (status.contains("cancel")) {
                    return paymentConfig.getFrontend().getPaymentCancelUrl(orderCode);
                }
            }
            

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

    private void sendPaymentSuccessEmail(Transaction transaction) {
        try {
            Optional<UserDto> user = userService.findById(transaction.getUserId());
            if (user.isEmpty()) {
                log.warn("User not found for transaction {}, skipping email notification", transaction.getId());
                return;
            }
            
            if (transaction.getSubscriptionId() != null) {
                log.info("Subscription confirmation email will be sent by subscription service for transaction {}", transaction.getId());
            } else {
                log.info("Payment confirmation email would be sent for transaction {} to user {}", 
                    transaction.getId(), user.get().getEmail());
                // emailService.sendPaymentConfirmation(user, transaction);
            }
        } catch (Exception e) {
            log.error("Failed to send payment success email for transaction {}. User will not receive email notification.", 
                transaction.getId(), e);
        }
    }

    /**
     * Process upgrade payment confirmation and apply subscription upgrade
     */
    private void processUpgradePaymentConfirmation(Transaction transaction) {
        try {
            log.info("Processing upgrade payment confirmation for transaction: {}", transaction.getId());
            
            // Extract upgrade details from transaction description
            String description = transaction.getDescription();
            if (description == null || !description.contains("from") || !description.contains("to")) {
                throw new IllegalStateException("Transaction description doesn't contain upgrade information");
            }
            
            // Parse tier information from description like "Upgrade from BASIC to PREMIUM"
            String[] parts = description.split(" ");
            String currentTierStr = null;
            String newTierStr = null;
            
            for (int i = 0; i < parts.length - 2; i++) {
                if ("from".equals(parts[i]) && i + 1 < parts.length) {
                    currentTierStr = parts[i + 1];
                }
                if ("to".equals(parts[i]) && i + 1 < parts.length) {
                    newTierStr = parts[i + 1];
                }
            }
            
            if (currentTierStr == null || newTierStr == null) {
                throw new IllegalStateException("Upgrade tier information is missing from transaction metadata");
            }
            
            // Create upgrade request
            org.kh.neuralpix.dto.request.SubscriptionUpgradeDto upgradeRequest = 
                new org.kh.neuralpix.dto.request.SubscriptionUpgradeDto();
            upgradeRequest.setNewTier(org.kh.neuralpix.model.enums.SubscriptionTier.valueOf(newTierStr));
            upgradeRequest.setReason("Payment confirmed upgrade");
            upgradeRequest.setUpgradeImmediately(true);
            upgradeRequest.setPaymentOrderCode(transaction.getOrderCode());
            
            // Apply the subscription upgrade
            subscriptionService.upgradeSubscription(transaction.getSubscriptionId(), upgradeRequest);
            
            log.info("Subscription upgrade applied successfully for transaction: {} - {} to {}", 
                transaction.getId(), currentTierStr, newTierStr);
                
        } catch (Exception e) {
            log.error("Failed to process upgrade payment confirmation for transaction: {}", transaction.getId(), e);
            throw e;
        }
    }
}
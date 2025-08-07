package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.dto.payos.ConfirmWebhookRequestBody;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.model.User;
import org.kh.neuralpix.repository.SubscriptionRepository;
import org.kh.neuralpix.repository.UserRepository;
import org.kh.neuralpix.repository.UserSubscriptionHistoryRepository;
import org.kh.neuralpix.model.UserSubscriptionHistory;
import org.kh.neuralpix.model.enums.SubscriptionTier;
import org.kh.neuralpix.service.EmailService;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.kh.neuralpix.service.SubscriptionService;
import org.kh.neuralpix.service.TransactionService;

import java.math.BigDecimal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/payos/webhook")
@RequiredArgsConstructor
@Slf4j
public class PayOSWebhookController {

    private final PayOSPaymentService payOSPaymentService;
    private final SubscriptionService subscriptionService;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionHistoryRepository historyRepository;
    private final EmailService emailService;
    private final TransactionService transactionService;

    @PostMapping("/subscription-renewal")
    public ResponseEntity<String> handleSubscriptionRenewalWebhook(@RequestBody ConfirmWebhookRequestBody requestBody) {
        try {
            log.info("Received PayOS webhook for subscription renewal: {}", requestBody);
            
            // Verify webhook signature (implement your security verification)
            if (!verifyWebhookSignature(requestBody)) {
                log.warn("Invalid webhook signature for renewal payment");
                return ResponseEntity.badRequest().body("Invalid signature");
            }
            
            // Find subscription by external subscription ID or order code
            Subscription subscription = findSubscriptionByPaymentData(requestBody);
            if (subscription == null) {
                log.warn("Subscription not found for payment data: {}", requestBody);
                return ResponseEntity.badRequest().body("Subscription not found");
            }
            
            // Update transaction status
            updateTransactionStatus(requestBody, Transaction.TransactionType.SUBSCRIPTION_RENEWAL);
            
            // Check payment status
            if ("PAID".equals(requestBody.getData().getStatus())) {
                // Payment successful - confirm the renewal
                confirmSubscriptionRenewal(subscription);
                log.info("Subscription renewal confirmed for subscription: {}", subscription.getId());
                return ResponseEntity.ok("Renewal confirmed");
                
            } else if ("CANCELLED".equals(requestBody.getData().getStatus())) {
                // Payment failed or cancelled - mark as past due
                markSubscriptionAsPastDue(subscription);
                log.warn("Subscription renewal payment failed for subscription: {}", subscription.getId());
                return ResponseEntity.ok("Payment failed, subscription marked as past due");
                
            } else {
                log.info("Received webhook with status: {} for subscription: {}", 
                        requestBody.getData().getStatus(), subscription.getId());
                return ResponseEntity.ok("Status received");
            }
            
        } catch (Exception e) {
            log.error("Error processing subscription renewal webhook", e);
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }

    @PostMapping("/subscription-payment")
    public ResponseEntity<String> handleSubscriptionPaymentWebhook(@RequestBody ConfirmWebhookRequestBody requestBody) {
        try {
            log.info("Received PayOS webhook for subscription payment: {}", requestBody);
            
            // Verify webhook signature
            if (!verifyWebhookSignature(requestBody)) {
                log.warn("Invalid webhook signature for subscription payment");
                return ResponseEntity.badRequest().body("Invalid signature");
            }
            
            // Find subscription by external subscription ID or order code
            Subscription subscription = findSubscriptionByPaymentData(requestBody);
            if (subscription == null) {
                log.warn("Subscription not found for payment data: {}", requestBody);
                return ResponseEntity.badRequest().body("Subscription not found");
            }
            
            // Update transaction status
            updateTransactionStatus(requestBody, Transaction.TransactionType.SUBSCRIPTION_PAYMENT);
            
            // Check payment status
            if ("PAID".equals(requestBody.getData().getStatus())) {
                // Payment successful - activate subscription
                activateSubscription(subscription);
                log.info("Subscription payment confirmed for subscription: {}", subscription.getId());
                return ResponseEntity.ok("Payment confirmed");
                
            } else if ("CANCELLED".equals(requestBody.getData().getStatus())) {
                // Payment failed or cancelled - cancel subscription
                cancelPendingSubscription(subscription);
                log.warn("Subscription payment failed for subscription: {}", subscription.getId());
                return ResponseEntity.ok("Payment failed");
                
            } else {
                log.info("Received webhook with status: {} for subscription: {}", 
                        requestBody.getData().getStatus(), subscription.getId());
                return ResponseEntity.ok("Status received");
            }
            
        } catch (Exception e) {
            log.error("Error processing subscription payment webhook", e);
            return ResponseEntity.internalServerError().body("Internal server error");
        }
    }

    private boolean verifyWebhookSignature(ConfirmWebhookRequestBody requestBody) {
        // Implement PayOS webhook signature verification
        // This should verify the webhook came from PayOS using their signature validation
        // For now, returning true - implement proper verification in production
        return true;
    }

    private Subscription findSubscriptionByPaymentData(ConfirmWebhookRequestBody requestBody) {
        try {
            // Try to find by external subscription ID first
            String orderCode = String.valueOf(requestBody.getData().getOrderCode());
            
            // Look for subscription with matching external subscription ID or order code pattern
            return subscriptionRepository.findByExternalSubscriptionId(orderCode)
                    .orElse(null);
                    
        } catch (Exception e) {
            log.error("Error finding subscription by payment data", e);
            return null;
        }
    }

    private void confirmSubscriptionRenewal(Subscription subscription) {
        try {
            // Mark subscription as active and extend dates
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscription.setUpdatedAt(LocalDateTime.now());
            
            // Extend subscription period
            LocalDateTime now = LocalDateTime.now();
            if (subscription.getBillingCycle() == Subscription.BillingCycle.YEARLY) {
                subscription.setEndDate(now.plusYears(1));
                subscription.setNextBillingDate(now.plusYears(1));
            } else {
                subscription.setEndDate(now.plusMonths(1));
                subscription.setNextBillingDate(now.plusMonths(1));
            }
            
            subscriptionRepository.save(subscription);
            log.info("Subscription renewal confirmed and extended for subscription: {}", subscription.getId());
            
        } catch (Exception e) {
            log.error("Error confirming subscription renewal for subscription: {}", subscription.getId(), e);
        }
    }

    private void markSubscriptionAsPastDue(Subscription subscription) {
        try {
            subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            
            log.info("Subscription marked as past due: {}", subscription.getId());
            
        } catch (Exception e) {
            log.error("Error marking subscription as past due for subscription: {}", subscription.getId(), e);
        }
    }

    private void activateSubscription(Subscription subscription) {
        try {
            // ✅ Active subscription  
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            
            // ✅ Upgrade user tier khi payment thành công
            User user = userRepository.findById(subscription.getUserId()).orElse(null);
            if (user != null) {
                user.setSubscriptionTier(subscription.getTier());
                userRepository.save(user);
                log.info("User {} upgraded to tier: {}", user.getId(), subscription.getTier());
                
                // ✅ Gửi confirmation email khi payment thành công
                emailService.sendSubscriptionConfirmation(user, subscription);
                log.info("Subscription confirmation email sent to user: {}", user.getEmail());
                
                // ✅ Record subscription history
                recordSubscriptionHistory(subscription.getUserId(), subscription.getId(), 
                    "ACTIVATED", SubscriptionTier.FREE.name(), subscription.getTier().name(), subscription.getPrice());
            }
            
            log.info("Subscription activated and user tier upgraded for subscription: {}", subscription.getId());
            
        } catch (Exception e) {
            log.error("Error activating subscription: {}", subscription.getId(), e);
        }
    }

    private void cancelPendingSubscription(Subscription subscription) {
        try {
            // ✅ Cancel subscription khi payment failed
            subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
            subscription.setCancellationReason("Payment failed or cancelled");
            subscription.setCancelledAt(LocalDateTime.now());
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            
            // ✅ Record subscription history
            User user = userRepository.findById(subscription.getUserId()).orElse(null);
            if (user != null) {
                recordSubscriptionHistory(subscription.getUserId(), subscription.getId(), 
                    "CANCELLED", subscription.getTier().name(), user.getSubscriptionTier().name(), BigDecimal.ZERO);
            }
            
            log.info("Subscription cancelled due to payment failure for subscription: {}", subscription.getId());
            
        } catch (Exception e) {
            log.error("Error cancelling pending subscription: {}", subscription.getId(), e);
        }
    }

    private void recordSubscriptionHistory(Long userId, Long subscriptionId, String actionType,
                                           String oldTier, String newTier, BigDecimal amount) {
        try {
            UserSubscriptionHistory history = UserSubscriptionHistory.builder()
                    .userId(userId)
                    .subscriptionId(subscriptionId)
                    .actionType(UserSubscriptionHistory.SubscriptionAction.valueOf(actionType))
                    .oldTier(SubscriptionTier.valueOf(oldTier))
                    .newTier(SubscriptionTier.valueOf(newTier))
                    .amountCharged(amount)
                    .createdAt(LocalDateTime.now())
                    .build();

            historyRepository.save(history);
            log.info("Recorded subscription history: {} for user: {}", actionType, userId);
        } catch (Exception e) {
            log.error("Error recording subscription history for user: {} action: {}", userId, actionType, e);
        }
    }

    /**
     * Cập nhật trạng thái transaction dựa trên webhook data
     */
    private void updateTransactionStatus(ConfirmWebhookRequestBody requestBody, Transaction.TransactionType expectedType) {
        try {
            Long orderCode = requestBody.getData().getOrderCode();
            String status = requestBody.getData().getStatus();
            
            // Cập nhật status dựa trên PayOS status
            switch (status) {
                case "PAID":
                    String paymentMethod = "PAYOS"; // PayOS payment method
                    transactionService.markTransactionAsPaid(orderCode, paymentMethod);
                    log.info("Transaction marked as PAID for order: {}", orderCode);
                    break;
                    
                case "CANCELLED":
                    transactionService.markTransactionAsCancelled(orderCode);
                    log.info("Transaction marked as CANCELLED for order: {}", orderCode);
                    break;
                    
                case "FAILED":
                    transactionService.markTransactionAsFailed(orderCode);
                    log.info("Transaction marked as FAILED for order: {}", orderCode);
                    break;
                    
                default:
                    log.info("No transaction status update for PayOS status: {} on order: {}", status, orderCode);
                    break;
            }
            
        } catch (Exception e) {
            log.error("Error updating transaction status for webhook: {}", requestBody, e);
            // Không throw exception để không ảnh hưởng đến webhook processing
        }
    }
} 
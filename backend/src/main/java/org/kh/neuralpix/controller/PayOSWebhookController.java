package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.dto.payos.ConfirmWebhookRequestBody;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.repository.SubscriptionRepository;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.kh.neuralpix.service.SubscriptionService;
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

            // Check payment status
            if ("PAID".equals(requestBody.getData().getStatus())) {
                // Payment successful - activate subscription
                activateSubscription(subscription);
                log.info("Subscription payment confirmed for subscription: {}", subscription.getId());
                return ResponseEntity.ok("Payment confirmed");

            } else if ("CANCELLED".equals(requestBody.getData().getStatus())) {
                // Payment failed or cancelled
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
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);

            log.info("Subscription activated: {}", subscription.getId());

        } catch (Exception e) {
            log.error("Error activating subscription: {}", subscription.getId(), e);
        }
    }
}
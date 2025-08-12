package org.kh.neuralpix.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.dto.SubscriptionDto;
import org.kh.neuralpix.dto.SubscriptionPlanDto;
import org.kh.neuralpix.dto.request.SubscriptionCancelDto;
import org.kh.neuralpix.dto.request.SubscriptionCreateRequestDto;
import org.kh.neuralpix.dto.request.SubscriptionUpdateDto;
import org.kh.neuralpix.exception.ResourceNotFoundException;
import org.kh.neuralpix.exception.SubscriptionException;
import org.kh.neuralpix.model.*;
import org.kh.neuralpix.model.enums.SubscriptionTier;
import org.kh.neuralpix.repository.*;
import org.kh.neuralpix.service.EmailService;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.kh.neuralpix.service.SubscriptionService;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionHistoryRepository historyRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final PayOSPaymentService payOSPaymentService;
    private final EmailService emailService;
    private final TransactionRepository transactionRepos;


    @Override
    public List<Subscription> getAll() {
        return subscriptionRepository.findAll();
    }

    @Override
    public Subscription getById(Long id) {
        return subscriptionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(
                "Subscription not found with id: " + id));
    }

    @Override
    public Subscription getByUserId(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    @Override
    public Optional<Subscription> getActiveSubscriptionByUserId(Long userId) {
        Subscription activeSubscription = subscriptionRepository.findActiveByUserId(userId);
        return Optional.ofNullable(activeSubscription);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void activateSubscription(Long subscriptionId) {
        log.info("Activating subscription: {}", subscriptionId);
        
        try {
            Subscription subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));
            
            if (subscription.getStatus() != Subscription.SubscriptionStatus.PENDING) {
                throw new IllegalArgumentException("Cannot activate subscription with status: " + subscription.getStatus());
            }
            
            // Activate subscription
            subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscription = subscriptionRepository.save(subscription);
            
            // Update user's subscription tier
            String userId = String.valueOf(subscription.getUserId());
            User user = userRepository.findById(subscription.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            
            SubscriptionTier oldTier = user.getSubscriptionTier();
            user.setSubscriptionTier(subscription.getTier());
            user = userRepository.save(user);
            
            // Record activation in history
            recordSubscriptionHistory(subscription.getUserId(), subscriptionId, "ACTIVATED",
                    oldTier != null ? oldTier.name() : "PENDING", subscription.getTier().name(), subscription.getPrice());
            
            // Send confirmation email (non-transactional)
            sendSubscriptionConfirmationEmailAsync(user, subscription);
            
            log.info("Successfully activated subscription: {} for user: {}", subscriptionId, user.getId());
            
        } catch (Exception e) {
            log.error("Error activating subscription: {}", subscriptionId, e);
            throw e; // This will trigger rollback
        }
    }
    
    /**
     * Send email asynchronously to avoid transaction rollback on email failure
     */
    private void sendSubscriptionConfirmationEmailAsync(User user, Subscription subscription) {
        try {
            emailService.sendSubscriptionConfirmation(user, subscription);
            log.info("Subscription confirmation email sent for subscription: {}", subscription.getId());
        } catch (Exception e) {
            log.error("Failed to send subscription confirmation email for subscription: {} - User will need to be notified manually", 
                subscription.getId(), e);
            // Don't fail the activation if email fails - just log it
            // Consider implementing a retry mechanism or notification queue
        }
    }

    @Override
    public List<Subscription> getByStatus(Subscription.SubscriptionStatus status) {
        return subscriptionRepository.findByStatus(status);
    }

    @Override
    @Transactional
    public SubscriptionDto create(SubscriptionCreateRequestDto request) {
        log.info("Creating subscription for user: {} with tier: {}", request.getUserId(), request.getTier());
        if (request.getUserId() == null || request.getTier() == null ||
                request.getBillingCycle() == null || request.getPaymentProvider() == null) {
            throw new IllegalArgumentException("Required fields are missing");
        }
        User user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        Subscription existingSubscription = subscriptionRepository.findActiveByUserId(request.getUserId());
        if (existingSubscription != null) {
            throw new IllegalArgumentException("User already has an active subscription");
        }
        SubscriptionPlan plan = subscriptionPlanRepository.findByTierAndIsActive(SubscriptionTier.valueOf(request.getTier()), SubscriptionPlan.IsActive.TRUE);
        if (plan == null) {
            throw new ResourceNotFoundException("Subscription plan not found for tier: " + request.getTier());
        }

        BigDecimal price = "yearly".equalsIgnoreCase(request.getBillingCycle()) ? plan.getYearlyPrice() : plan.getMonthlyPrice();

        Subscription subscription = Subscription.builder()
                .user(user)
                .userId(request.getUserId())
                .status(Subscription.SubscriptionStatus.PENDING)
                .tier(SubscriptionTier.valueOf(request.getTier()))
                .billingCycle(Subscription.BillingCycle.valueOf(request.getBillingCycle()))
                .price(price)
                .paymentProvider(request.getPaymentProvider())
                .autoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : true)
                .startDate(LocalDateTime.now())
                .endDate(request.getBillingCycle().equalsIgnoreCase("yearly") ?
                        LocalDateTime.now().plusYears(1) : LocalDateTime.now().plusMonths(1))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .nextBillingDate(request.getBillingCycle().equalsIgnoreCase("yearly") ?
                        LocalDateTime.now().plusYears(1) : LocalDateTime.now().plusMonths(1))
                .build();
        subscriptionRepository.save(subscription);

        recordSubscriptionHistory(user.getId(), subscription.getId(), "CREATED", user.getSubscriptionTier().name(), request.getTier(), price);

        subscription = subscriptionRepository.save(subscription);

//        if (paymentLinkId != null) {
//            subscription.setExternalSubscriptionId(paymentLinkId);
//            subscription = subscriptionRepository.save(subscription);
//        }
        
        log.info("Successfully created subscription: {} for user: {}", subscription.getId(), user.getId());
        
        SubscriptionDto result = convertToDTO(subscription);

//        if (paymentLinkId != null) {
//            log.info("PayOS payment link created for subscription {}", subscription.getId());
//        }
        
        return result;
    }

    @Override
    @Transactional
    public SubscriptionDto update(Long id, SubscriptionUpdateDto request) {
        log.info("Updating subscription: {}", id);
        if (!subscriptionRepository.existsById(id)) {
            throw new IllegalArgumentException("Subscription not found with id: " + id);
        }
        Subscription subscription = subscriptionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Subscription not found with id: " + id));
        if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot update subscription with status: " + subscription.getStatus());
        }

        String oldTier = subscription.getTier().name();
        BigDecimal oldPrice = subscription.getPrice();

        if (request.getTier() != null && !request.getTier().equals(oldTier)){
            SubscriptionPlan newPlan = subscriptionPlanRepository.findByTierAndIsActive(
                    SubscriptionTier.valueOf(request.getTier()), SubscriptionPlan.IsActive.TRUE);
            if (newPlan == null) {
                throw new ResourceNotFoundException("Subscription plan not found for tier: " + request.getTier());
            }
            BigDecimal newPrice = "yearly".equalsIgnoreCase(request.getBillingCycle()) ? newPlan.getYearlyPrice() : newPlan.getMonthlyPrice();

            BigDecimal priceDifference = newPrice.subtract(oldPrice);
            subscription.setTier(SubscriptionTier.valueOf(request.getTier()));
            subscription.setPrice(newPrice);

            Subscription finalSubscription = subscription;
            User user = userRepository.findById(finalSubscription.getUserId()).orElseThrow(
                    () -> new ResourceNotFoundException("User not found with id: " + finalSubscription.getUserId()));

            user.setSubscriptionTier(SubscriptionTier.valueOf(request.getTier()));
            userRepository.save(user);


            //record history
            String actionType = isUpgrade(oldTier, request.getTier()) ? "UPGRADED" : "DOWNGRADED";
            recordSubscriptionHistory(user.getId(), subscription.getId(), actionType, oldTier, request.getTier(), priceDifference);

        }

        if (request.getBillingCycle() != null && !request.getBillingCycle().equals(subscription.getBillingCycle().name())) {
            subscription.setBillingCycle(Subscription.BillingCycle.valueOf(request.getBillingCycle()));
            subscription.setBillingCycle(Subscription.BillingCycle.valueOf(request.getBillingCycle()));
            if ("yearly".equalsIgnoreCase(request.getBillingCycle())) {
                subscription.setEndDate(LocalDateTime.now().plusYears(1));
                subscription.setNextBillingDate(LocalDateTime.now().plusYears(1));
            } else {
                subscription.setEndDate(LocalDateTime.now().plusMonths(1));
                subscription.setNextBillingDate(LocalDateTime.now().plusMonths(1));
            }
        }

        if (request.getAutoRenew() != null) {
            subscription.setAutoRenew(request.getAutoRenew());
        }

        subscription.setUpdatedAt(LocalDateTime.now());
        subscription = subscriptionRepository.save(subscription);
        subscriptionRepository.save(subscription);
        return convertToDTO(subscription);
    }

    @Override
    @Transactional
    public void cancelSubscription(Long subscriptionId, SubscriptionCancelDto request) {
        log.info("Cancelling subscription: {}", subscriptionId);
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException("Subscription not found"));
        if (subscription.getStatus() != Subscription.SubscriptionStatus.ACTIVE) {
            throw new SubscriptionException("Cannot cancel inactive subscription");
        }
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
        subscription.setCancellationReason(request.getReason());
        subscription.setCancelledAt(LocalDateTime.now());

        if (request.getCancelImmediately()){
            subscription.setEndDate(LocalDateTime.now());
            User user = userRepository.findById(subscription.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + subscription.getUserId()));
            user.setSubscriptionTier(SubscriptionTier.FREE);
            userRepository.save(user);
        }else{
            subscription.setAutoRenew(false);
        }

        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);
        log.info("Successfully cancelled subscription: {}", subscriptionId);

        recordSubscriptionHistory(subscription.getUserId(), subscriptionId, "cancelled",
                subscription.getTier().name(), "FREE", BigDecimal.ZERO);

        User user = userRepository.findById(subscription.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + subscription.getUserId()));

        // Send cancellation confirmation email
        emailService.sendCancellationConfirmation(user, subscription);
    }

    @Override
    @Transactional
    public void renewSubscription(Long subscriptionId) {
        log.info("Renewing subscription: {}", subscriptionId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException("Subscription not found"));

        if (!subscription.getAutoRenew()) {
            log.info("Subscription {} has auto-renew disabled, expiring instead", subscriptionId);
            expireSubscription(subscriptionId);
            return;
        }

        try {
            User user = userRepository.findById(subscription.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            // Process payment with PayOS
            boolean paymentSuccessful = processRenewalPayment(subscription, user);

            if (paymentSuccessful) {
                // Extend subscription
                subscription.setStartDate(LocalDateTime.now());
                subscription.setEndDate(calculateEndDate(subscription.getBillingCycle()));
                subscription.setNextBillingDate(calculateNextBillingDate(subscription.getBillingCycle()));
                subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
                subscription.setUpdatedAt(LocalDateTime.now());

                subscriptionRepository.save(subscription);

                // Record history
                recordSubscriptionHistory(subscription.getUserId(), subscriptionId, "RENEWED",
                        subscription.getTier().name(), subscription.getTier().name(), subscription.getPrice());

                // Send renewal confirmation
                emailService.sendSubscriptionConfirmation(user, subscription);
                
                log.info("Successfully renewed subscription: {}", subscriptionId);

            } else {
                // Payment failed - mark as past due
                subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
                subscription.setUpdatedAt(LocalDateTime.now());
                subscriptionRepository.save(subscription);

                // Send payment failure notification (you can create this method in EmailService)
                log.warn("Payment failed for subscription renewal: {}", subscriptionId);
                // emailService.sendPaymentFailureNotification(user, subscription);
            }

        } catch (Exception e) {
            log.error("Failed to renew subscription: {}", subscriptionId, e);
            subscription.setStatus(Subscription.SubscriptionStatus.PAST_DUE);
            subscription.setUpdatedAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
        }
    }

    /**
     * Process renewal payment using PayOS
     */
    private boolean processRenewalPayment(Subscription subscription, User user) {
        try {
            if ("payos".equalsIgnoreCase(subscription.getPaymentProvider())) {
                // Create PayOS payment for renewal
                Long orderCode = System.currentTimeMillis() / 1000;
                String description = "Renewal for " + subscription.getTier() + " subscription - " + subscription.getBillingCycle();
                
                vn.payos.type.CheckoutResponseData paymentResponse = payOSPaymentService.createPaymentLink(
                        orderCode, subscription.getPrice(), description, user.getEmail());
                
                if (paymentResponse != null && paymentResponse.getPaymentLinkId() != null) {
                    // Update external subscription ID
                    subscription.setExternalSubscriptionId(paymentResponse.getPaymentLinkId());
                    
                    log.info("PayOS renewal payment link created for subscription: {} with order code: {}", 
                            subscription.getId(), orderCode);
                    
                    // For automatic renewal, you might want to implement webhook handling
                    // For now, we'll assume payment is successful (in real scenario, this would be handled by webhook)
                    return true;
                } else {
                    log.error("Failed to create PayOS payment link for renewal");
                    return false;
                }
            } else {
                log.warn("Unsupported payment provider for renewal: {}", subscription.getPaymentProvider());
                return false;
            }
        } catch (Exception e) {
            log.error("Error processing renewal payment for subscription: {}", subscription.getId(), e);
            return false;
        }
    }

    /**
     * Calculate end date based on billing cycle
     */
    private LocalDateTime calculateEndDate(Subscription.BillingCycle billingCycle) {
        LocalDateTime now = LocalDateTime.now();
        switch (billingCycle) {
            case MONTHLY:
                return now.plusMonths(1);
            case YEARLY:
                return now.plusYears(1);
            default:
                return now.plusMonths(1);
        }
    }

    /**
     * Calculate next billing date based on billing cycle
     */
    private LocalDateTime calculateNextBillingDate(Subscription.BillingCycle billingCycle) {
        return calculateEndDate(billingCycle);
    }

    @Override
    @Transactional
    public void expireSubscription(Long subscriptionId) {
        log.info("Expiring subscription: {}", subscriptionId);

        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new SubscriptionException("Subscription not found"));

        subscription.setStatus(Subscription.SubscriptionStatus.EXPIRED);
        subscription.setEndDate(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());

        // Downgrade user to free tier
        User user = userRepository.findById(subscription.getUserId()).orElseThrow();
        String oldTier = String.valueOf(user.getSubscriptionTier());
        user.setSubscriptionTier(SubscriptionTier.FREE);
        userRepository.save(user);

        subscriptionRepository.save(subscription);

        // Record history
        recordSubscriptionHistory(subscription.getUserId(), subscriptionId, "EXPIRED",
                oldTier, "FREE", BigDecimal.ZERO);

        // Send expiration notification email
        emailService.sendExpirationNotification(user, subscription);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!subscriptionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subscription not found with id: " + id);
        }
        Subscription subscription = subscriptionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("Subscription not found with id: " + id));
        subscription.setStatus(Subscription.SubscriptionStatus.CANCELLED);
    }


    private boolean isUpgrade(String oldTier, String newTier) {
        int oldLevel = getTierLevel(oldTier);
        int newLevel = getTierLevel(newTier);
        return newLevel > oldLevel;
    }

    private int getTierLevel(String tier) {
        switch (tier.toLowerCase()) {
            case "free": return 0;
            case "basic": return 1;
            case "premium": return 2;
            default: return 0;
        }
    }

    private void recordSubscriptionHistory(Long userId, Long subscriptionId, String actionType,
                                           String oldTier, String newTier, BigDecimal amount) {
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
    }

    private SubscriptionDto convertToDTO(Subscription subscription) {
        SubscriptionPlan plan = subscriptionPlanRepository.findByTierAndIsActive(subscription.getTier(), SubscriptionPlan.IsActive.TRUE);
        if (plan == null) {
            log.warn("No active plan found for tier: {}", subscription.getTier());
        }

        return SubscriptionDto.builder()
                .id(subscription.getId())
                .userId(subscription.getUserId())
                .tier(String.valueOf(subscription.getTier()))
                .status(String.valueOf(subscription.getStatus()))
                .billingCycle(String.valueOf(subscription.getBillingCycle()))
                .price(subscription.getPrice())
                .currency(subscription.getCurrency())
                .paymentProvider(subscription.getPaymentProvider())
                .externalSubscriptionId(subscription.getExternalSubscriptionId())
                .autoRenew(subscription.getAutoRenew())
                .cancellationReason(subscription.getCancellationReason())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .nextBillingDate(subscription.getNextBillingDate())
                .cancelledAt(subscription.getCancelledAt())
                .createdAt(subscription.getCreatedAt())
                .plan(plan != null ? convertPlanToDTO(plan) : null)
                .build();
    }

    private SubscriptionPlanDto convertPlanToDTO(SubscriptionPlan plan) {
        return SubscriptionPlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .tier(String.valueOf(plan.getTier()))
                .monthlyPrice(plan.getMonthlyPrice())
                .yearlyPrice(plan.getYearlyPrice())
                .dailyGenerationLimit(plan.getDailyGenerationLimit())
                .monthlyGenerationLimit(plan.getMonthlyGenerationLimit())
                .concurrentGenerations(plan.getConcurrentGenerations())
                .maxImageResolution(plan.getMaxImageResolution())
                .apiAccess(plan.getApiAccess())
                .commercialLicense(plan.getCommercialLicense())
                .priorityProcessing(plan.getPriorityProcessing())
                .watermarkRemoval(plan.getWatermarkRemoval())
                .advancedModels(plan.getAdvancedModels())
                .isActive(String.valueOf(plan.getIsActive()))
                .sortOrder(plan.getSortOrder())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }


}

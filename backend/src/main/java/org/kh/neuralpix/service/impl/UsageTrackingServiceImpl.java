package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.dto.response.UsageTrackingResponseDto;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.kh.neuralpix.repository.UsageTrackingRepository;
import org.kh.neuralpix.service.SubscriptionService;
import org.kh.neuralpix.service.SubscriptionPlanService;
import org.kh.neuralpix.service.UsageTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UsageTrackingServiceImpl implements UsageTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(UsageTrackingServiceImpl.class);

    private final UsageTrackingRepository repository;
    private final SubscriptionService subscriptionService;
    private final SubscriptionPlanService subscriptionPlanService;

    @Autowired
    public UsageTrackingServiceImpl(UsageTrackingRepository repository,
                                   SubscriptionService subscriptionService,
                                   SubscriptionPlanService subscriptionPlanService) {
        this.repository = repository;
        this.subscriptionService = subscriptionService;
        this.subscriptionPlanService = subscriptionPlanService;
    }

    @Override
    public List<UsageTracking> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<UsageTracking> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<UsageTracking> getByUserDateType(Long userId, LocalDate date, UsageType usageType) {
        return repository.findByUserIdAndUsageDateAndUsageType(userId, date, usageType);
    }

    @Override
    public UsageTracking create(UsageTracking usageTracking) {
        return repository.save(usageTracking);
    }

    @Override
    public UsageTracking update(Long id, UsageTracking updated) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("UsageTracking with id " + id + " not found");
        }
        updated.setId(id);
        return repository.save(updated);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public void trackImageGeneration(Long userId) {
        LocalDate today = LocalDate.now();
        
        // Track daily usage
        incrementUsage(userId, UsageType.DAILY_GENERATION, today);
        
        // Track monthly usage
        incrementUsage(userId, UsageType.MONTHLY_GENERATION, today);
        
        logger.info("Tracked image generation for user: {}", userId);
    }

    @Override
    public boolean canGenerateImage(Long userId) {
        return !hasExceededDailyLimit(userId) && !hasExceededMonthlyLimit(userId);
    }

    @Override
    public int getDailyUsageCount(Long userId, LocalDate date) {
        Integer count = repository.sumUsageCountByUserIdAndDateAndType(userId, date, UsageType.DAILY_GENERATION);
        return count != null ? count : 0;
    }

    @Override
    public int getMonthlyUsageCount(Long userId, LocalDate date) {
        Integer count = repository.sumMonthlyUsageByUserIdAndType(
            userId, UsageType.MONTHLY_GENERATION, date.getYear(), date.getMonthValue());
        return count != null ? count : 0;
    }

    @Override
    public void resetDailyUsage(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<UsageTracking> existingUsage = repository.findByUserIdAndUsageDateAndUsageType(
            userId, today, UsageType.DAILY_GENERATION);
        
        if (existingUsage.isPresent()) {
            UsageTracking usage = existingUsage.get();
            usage.setUsageCount(0);
            usage.setResetAt(LocalDateTime.now());
            repository.save(usage);
            logger.info("Reset daily usage for user: {}", userId);
        }
    }

    @Override
    public void resetMonthlyUsage(Long userId) {
        LocalDate today = LocalDate.now();
        Optional<UsageTracking> existingUsage = repository.findByUserIdAndUsageDateAndUsageType(
            userId, today, UsageType.MONTHLY_GENERATION);
        
        if (existingUsage.isPresent()) {
            UsageTracking usage = existingUsage.get();
            usage.setUsageCount(0);
            usage.setResetAt(LocalDateTime.now());
            repository.save(usage);
            logger.info("Reset monthly usage for user: {}", userId);
        }
    }

    @Override
    public UsageTracking incrementUsage(Long userId, UsageType usageType, LocalDate date) {
        Optional<UsageTracking> existingUsage = repository.findByUserIdAndUsageDateAndUsageType(
            userId, date, usageType);
        
        UsageTracking usage;
        if (existingUsage.isPresent()) {
            usage = existingUsage.get();
            usage.setUsageCount(usage.getUsageCount() + 1);
        } else {
            usage = new UsageTracking();
            usage.setUserId(userId);
            usage.setUsageDate(date);
            usage.setUsageType(usageType);
            usage.setUsageCount(1);
        }
        
        return repository.save(usage);
    }

    @Override
    public boolean hasExceededDailyLimit(Long userId) {
        try {
            Optional<Subscription> subscription = subscriptionService.getActiveSubscriptionByUserId(userId);
            if (subscription.isEmpty()) {
                logger.warn("No active subscription found for user: {}", userId);
                return true; // No subscription = no generation allowed
            }

            Optional<SubscriptionPlan> plan = subscriptionPlanService.getByTier(subscription.get().getTier());
            if (plan.isEmpty()) {
                logger.warn("No subscription plan found for tier: {}", subscription.get().getTier());
                return true;
            }

            Integer dailyLimit = plan.get().getDailyGenerationLimit();
            if (dailyLimit == -1) {
                return false; // Unlimited
            }

            int currentUsage = getDailyUsageCount(userId, LocalDate.now());
            return currentUsage >= dailyLimit;
            
        } catch (Exception e) {
            logger.error("Error checking daily limit for user: {}", userId, e);
            return true; // Default to limiting access on error
        }
    }

    @Override
    public boolean hasExceededMonthlyLimit(Long userId) {
        try {
            Optional<Subscription> subscription = subscriptionService.getActiveSubscriptionByUserId(userId);
            if (subscription.isEmpty()) {
                logger.warn("No active subscription found for user: {}", userId);
                return true;
            }

            Optional<SubscriptionPlan> plan = subscriptionPlanService.getByTier(subscription.get().getTier());
            if (plan.isEmpty()) {
                logger.warn("No subscription plan found for tier: {}", subscription.get().getTier());
                return true;
            }

            Integer monthlyLimit = plan.get().getMonthlyGenerationLimit();
            if (monthlyLimit == -1) {
                return false; // Unlimited
            }

            int currentUsage = getMonthlyUsageCount(userId, LocalDate.now());
            return currentUsage >= monthlyLimit;
            
        } catch (Exception e) {
            logger.error("Error checking monthly limit for user: {}", userId, e);
            return true;
        }
    }

    @Override
    public int getRemainingDailyGenerations(Long userId) {
        try {
            Optional<Subscription> subscription = subscriptionService.getActiveSubscriptionByUserId(userId);
            if (subscription.isEmpty()) {
                return 0;
            }

            Optional<SubscriptionPlan> plan = subscriptionPlanService.getByTier(subscription.get().getTier());
            if (plan.isEmpty()) {
                return 0;
            }

            Integer dailyLimit = plan.get().getDailyGenerationLimit();
            if (dailyLimit == -1) {
                return Integer.MAX_VALUE; // Unlimited
            }

            int currentUsage = getDailyUsageCount(userId, LocalDate.now());
            return Math.max(0, dailyLimit - currentUsage);
            
        } catch (Exception e) {
            logger.error("Error getting remaining daily generations for user: {}", userId, e);
            return 0;
        }
    }

    @Override
    public int getRemainingMonthlyGenerations(Long userId) {
        try {
            Optional<Subscription> subscription = subscriptionService.getActiveSubscriptionByUserId(userId);
            if (subscription.isEmpty()) {
                return 0;
            }

            Optional<SubscriptionPlan> plan = subscriptionPlanService.getByTier(subscription.get().getTier());
            if (plan.isEmpty()) {
                return 0;
            }

            Integer monthlyLimit = plan.get().getMonthlyGenerationLimit();
            if (monthlyLimit == -1) {
                return Integer.MAX_VALUE; // Unlimited
            }

            int currentUsage = getMonthlyUsageCount(userId, LocalDate.now());
            return Math.max(0, monthlyLimit - currentUsage);
            
        } catch (Exception e) {
            logger.error("Error getting remaining monthly generations for user: {}", userId, e);
            return 0;
        }
    }

    @Override
    public UsageTrackingResponseDto getComprehensiveUsageInfo(Long userId) {
        try {
            LocalDate today = LocalDate.now();
            
            // Get subscription information
            Optional<Subscription> subscription = subscriptionService.getActiveSubscriptionByUserId(userId);
            String subscriptionTier = subscription.map(s -> s.getTier().name()).orElse("NO_SUBSCRIPTION");
            
            Optional<SubscriptionPlan> plan = subscription.isPresent() ? 
                subscriptionPlanService.getByTier(subscription.get().getTier()) : Optional.empty();
            
            // Daily usage information
            int dailyUsage = getDailyUsageCount(userId, today);
            int dailyLimit = plan.map(SubscriptionPlan::getDailyGenerationLimit).orElse(0);
            boolean isDailyUnlimited = dailyLimit == -1;
            int dailyRemaining = isDailyUnlimited ? Integer.MAX_VALUE : Math.max(0, dailyLimit - dailyUsage);
            boolean hasExceededDaily = hasExceededDailyLimit(userId);
            
            // Monthly usage information
            int monthlyUsage = getMonthlyUsageCount(userId, today);
            int monthlyLimit = plan.map(SubscriptionPlan::getMonthlyGenerationLimit).orElse(0);
            boolean isMonthlyUnlimited = monthlyLimit == -1;
            int monthlyRemaining = isMonthlyUnlimited ? Integer.MAX_VALUE : Math.max(0, monthlyLimit - monthlyUsage);
            boolean hasExceededMonthly = hasExceededMonthlyLimit(userId);
            
            // Overall status
            boolean canGenerate = canGenerateImage(userId);
            boolean hasActiveLimits = plan.isPresent() && (dailyLimit > 0 || monthlyLimit > 0);
            
            String message = "";
            if (!canGenerate) {
                if (hasExceededDaily && hasExceededMonthly) {
                    message = "Both daily and monthly limits exceeded";
                } else if (hasExceededDaily) {
                    message = "Daily limit exceeded";
                } else if (hasExceededMonthly) {
                    message = "Monthly limit exceeded";
                } else {
                    message = "No active subscription";
                }
            } else {
                message = "Generation allowed";
            }
            
            return UsageTrackingResponseDto.builder()
                .userId(userId)
                .canGenerate(canGenerate)
                .dailyUsage(UsageTrackingResponseDto.DailyUsage.builder()
                    .date(today)
                    .currentUsage(dailyUsage)
                    .remaining(dailyRemaining)
                    .limit(dailyLimit)
                    .isUnlimited(isDailyUnlimited)
                    .hasExceeded(hasExceededDaily)
                    .build())
                .monthlyUsage(UsageTrackingResponseDto.MonthlyUsage.builder()
                    .year(today.getYear())
                    .month(today.getMonthValue())
                    .currentUsage(monthlyUsage)
                    .remaining(monthlyRemaining)
                    .limit(monthlyLimit)
                    .isUnlimited(isMonthlyUnlimited)
                    .hasExceeded(hasExceededMonthly)
                    .build())
                .limitStatus(UsageTrackingResponseDto.LimitStatus.builder()
                    .hasActiveLimits(hasActiveLimits)
                    .hasExceededDailyLimit(hasExceededDaily)
                    .hasExceededMonthlyLimit(hasExceededMonthly)
                    .subscriptionTier(subscriptionTier)
                    .message(message)
                    .build())
                .build();
                
        } catch (Exception e) {
            logger.error("Error getting comprehensive usage info for user: {}", userId, e);
            
            // Return error state
            return UsageTrackingResponseDto.builder()
                .userId(userId)
                .canGenerate(false)
                .limitStatus(UsageTrackingResponseDto.LimitStatus.builder()
                    .hasActiveLimits(false)
                    .hasExceededDailyLimit(true)
                    .hasExceededMonthlyLimit(true)
                    .subscriptionTier("ERROR")
                    .message("Error retrieving usage information")
                    .build())
                .build();
        }
    }
}

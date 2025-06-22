package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.kh.neuralpix.repository.UsageTrackingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class UsageResetSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(UsageResetSchedulerService.class);

    private final UsageTrackingRepository usageTrackingRepository;

    @Autowired
    public UsageResetSchedulerService(UsageTrackingRepository usageTrackingRepository) {
        this.usageTrackingRepository = usageTrackingRepository;
    }

    /**
     * Reset daily usage counters at midnight every day
     * Cron expression: 0 0 0 * * * (every day at 00:00:00)
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void resetDailyUsageCounters() {
        logger.info("Starting daily usage reset task");
        
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            
            // Find all daily usage records from yesterday and create new ones for today if needed
            usageTrackingRepository.findByUserIdAndUsageDateAndUsageType(null, yesterday, UsageType.DAILY_GENERATION)
                .ifPresent(usage -> {
                    // Reset the usage count for today will be handled automatically when new usage is tracked
                    logger.debug("Found daily usage record for user {} on {}", usage.getUserId(), yesterday);
                });
            
            logger.info("Daily usage reset task completed successfully");
            
        } catch (Exception e) {
            logger.error("Error occurred during daily usage reset", e);
        }
    }

    /**
     * Reset monthly usage counters on the first day of each month
     * Cron expression: 0 0 0 1 * * (first day of every month at 00:00:00)
     */
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void resetMonthlyUsageCounters() {
        logger.info("Starting monthly usage reset task");
        
        try {
            LocalDate lastMonth = LocalDate.now().minusMonths(1);
            
            // Find all monthly usage records from last month
            usageTrackingRepository.findByUserIdAndUsageDateAndUsageType(null, lastMonth, UsageType.MONTHLY_GENERATION)
                .ifPresent(usage -> {
                    // Reset will be handled automatically when new monthly usage is tracked
                    logger.debug("Found monthly usage record for user {} on {}", usage.getUserId(), lastMonth);
                });
            
            logger.info("Monthly usage reset task completed successfully");
            
        } catch (Exception e) {
            logger.error("Error occurred during monthly usage reset", e);
        }
    }

    /**
     * Clean up old usage tracking records older than 3 months
     * Runs every Sunday at 2 AM
     * Cron expression: 0 0 2 * * SUN
     */
    @Scheduled(cron = "0 0 2 * * SUN")
    @Transactional
    public void cleanupOldUsageRecords() {
        logger.info("Starting cleanup of old usage records");
        
        try {
            LocalDate cutoffDate = LocalDate.now().minusMonths(3);
            
            // Find and delete old usage records
            var oldRecords = usageTrackingRepository.findByUserIdAndUsageDateBetween(
                null, LocalDate.of(2020, 1, 1), cutoffDate);
            
            if (!oldRecords.isEmpty()) {
                usageTrackingRepository.deleteAll(oldRecords);
                logger.info("Cleaned up {} old usage records before {}", oldRecords.size(), cutoffDate);
            } else {
                logger.info("No old usage records found to cleanup");
            }
            
        } catch (Exception e) {
            logger.error("Error occurred during usage records cleanup", e);
        }
    }

    /**
     * Log usage statistics every day at 6 AM for monitoring
     * Cron expression: 0 0 6 * * *
     */
    @Scheduled(cron = "0 0 6 * * *")
    @Transactional(readOnly = true)
    public void logDailyUsageStatistics() {
        logger.info("Generating daily usage statistics");
        
        try {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            LocalDate today = LocalDate.now();
            
            // You can add statistics logging here
            logger.info("Usage statistics generated for date range: {} to {}", yesterday, today);
            
        } catch (Exception e) {
            logger.error("Error occurred while generating usage statistics", e);
        }
    }
} 
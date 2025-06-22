package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.response.UsageTrackingResponseDto;
import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UsageTrackingService {
    List<UsageTracking> getAll();
    Optional<UsageTracking> getById(Long id);
    Optional<UsageTracking> getByUserDateType(Long userId, LocalDate date, UsageType usageType);
    UsageTracking create(UsageTracking usageTracking);
    UsageTracking update(Long id, UsageTracking usageTracking);
    void delete(Long id);
    
    // Enhanced usage tracking methods
    void trackImageGeneration(Long userId);
    boolean canGenerateImage(Long userId);
    int getDailyUsageCount(Long userId, LocalDate date);
    int getMonthlyUsageCount(Long userId, LocalDate date);
    void resetDailyUsage(Long userId);
    void resetMonthlyUsage(Long userId);
    UsageTracking incrementUsage(Long userId, UsageType usageType, LocalDate date);
    
    // Usage limit checking
    boolean hasExceededDailyLimit(Long userId);
    boolean hasExceededMonthlyLimit(Long userId);
    int getRemainingDailyGenerations(Long userId);
    int getRemainingMonthlyGenerations(Long userId);
    
    // Comprehensive usage information
    UsageTrackingResponseDto getComprehensiveUsageInfo(Long userId);
}

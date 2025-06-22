package org.kh.neuralpix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageTrackingResponseDto {

    private Long userId;
    private boolean canGenerate;
    private DailyUsage dailyUsage;
    private MonthlyUsage monthlyUsage;
    private LimitStatus limitStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyUsage {
        private LocalDate date;
        private int currentUsage;
        private int remaining;
        private int limit;
        private boolean isUnlimited;
        private boolean hasExceeded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyUsage {
        private int year;
        private int month;
        private int currentUsage;
        private int remaining;
        private int limit;
        private boolean isUnlimited;
        private boolean hasExceeded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LimitStatus {
        private boolean hasActiveLimits;
        private boolean hasExceededDailyLimit;
        private boolean hasExceededMonthlyLimit;
        private String subscriptionTier;
        private String message;
    }
} 
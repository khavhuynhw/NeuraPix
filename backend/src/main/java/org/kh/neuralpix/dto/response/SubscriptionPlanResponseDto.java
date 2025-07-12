package org.kh.neuralpix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.enums.SubscriptionTier;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for Subscription Plan response.
 * This class is used to transfer subscription plan data in API responses.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionPlanResponseDto {
    private String name;
    private SubscriptionTier tier;
    private String description;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private Integer dailyGenerationLimit;
    private Integer monthlyGenerationLimit;
    private Integer maxImageResolution;
    private Boolean priorityProcessing;
    private Boolean watermarkRemoval;
    private Boolean commercialLicense;
    private Boolean apiAccess;
    private Boolean advancedModels;
    private Integer concurrentGenerations;
    private String isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package org.kh.neuralpix.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.enums.SubscriptionTier;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionPlanRequestDto {
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
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

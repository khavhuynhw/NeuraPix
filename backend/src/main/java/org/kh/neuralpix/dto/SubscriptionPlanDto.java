package org.kh.neuralpix.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.validator.constraints.Length;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for {@link org.kh.neuralpix.model.SubscriptionPlan}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionPlanDto {

    private Long id;
    @NotBlank(message = "Plan name is required")
    @Length(min = 3, max = 20)
    private String name;

    @NotNull
    private String tier;

    @Length(min = 10)
    private String description;

    @Positive(message = "must be > 0")
    private BigDecimal monthlyPrice;

    @Positive
    private BigDecimal yearlyPrice;

    @Min(value = -1, message = "Daily limit must be -1 (unlimited) or positive")
    private Integer dailyGenerationLimit;

    @Min(value = -1, message = "Monthly limit must be -1 (unlimited) or positive")
    private Integer monthlyGenerationLimit;

    @Min(value = 256, message = "Max resolution must be at least 256")
    private Integer maxImageResolution;

    private Boolean priorityProcessing;
    private Boolean watermarkRemoval;
    private Boolean commercialLicense;
    private Boolean apiAccess;
    private Boolean advancedModels;

    @Min(value = 1, message = "Concurrent generations must be at least 1")
    private Integer concurrentGenerations;

    private String isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

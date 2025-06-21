package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Plan name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier tier;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "monthly_price", precision = 10, scale = 2, nullable = false)
    @DecimalMin(value = "0.0", message = "Monthly price cannot be negative")
    private BigDecimal monthlyPrice;

    @Column(name = "yearly_price", precision = 10, scale = 2, nullable = false)
    @DecimalMin(value = "0.0", message = "Yearly price cannot be negative")
    private BigDecimal yearlyPrice;

    @Column(name = "daily_generation_limit", nullable = false)
    @Min(value = -1, message = "Daily limit must be -1 (unlimited) or positive")
    private Integer dailyGenerationLimit;

    @Column(name = "monthly_generation_limit", nullable = false)
    @Min(value = -1, message = "Monthly limit must be -1 (unlimited) or positive")
    private Integer monthlyGenerationLimit;

    @Column(name = "max_image_resolution", nullable = false)
    @Min(value = 256, message = "Max resolution must be at least 256")
    private Integer maxImageResolution;

    @Column(name = "priority_processing", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean priorityProcessing = false;

    @Column(name = "watermark_removal", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean watermarkRemoval = false;

    @Column(name = "commercial_license", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean commercialLicense = false;

    @Column(name = "api_access", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean apiAccess = false;

    @Column(name = "advanced_models", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean advancedModels = false;

    @Column(name = "concurrent_generations", columnDefinition = "INT DEFAULT 1")
    @Min(value = 1, message = "Concurrent generations must be at least 1")
    private Integer concurrentGenerations = 1;

    @Column(name = "is_active")
    @Enumerated(EnumType.STRING)
    private IsActive isActive;

    public  enum IsActive {
        TRUE, FALSE
    }

    @Column(name = "sort_order", columnDefinition = "INT DEFAULT 0")
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

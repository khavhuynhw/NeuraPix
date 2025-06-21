package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionTier tier;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active'")
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "next_billing_date")
    private LocalDateTime nextBillingDate;

    @Column(precision = 10, scale = 2, nullable = false)
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    @Column(length = 3, columnDefinition = "VARCHAR(3) DEFAULT 'USD'")
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", columnDefinition = "ENUM('monthly', 'yearly') DEFAULT 'monthly'")
    private BillingCycle billingCycle = BillingCycle.MONTHLY;

    @Column(name = "payment_provider", length = 50)
    private String paymentProvider;

    @Column(name = "external_subscription_id")
    private String externalSubscriptionId;

    @Column(name = "auto_renew", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean autoRenew = true;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    public enum BillingCycle{
        MONTHLY,
        YEARLY
    }

    public  enum SubscriptionStatus{
        ACTIVE,
        PAST_DUE,
        CANCELLED,
        EXPIRED
    }
}

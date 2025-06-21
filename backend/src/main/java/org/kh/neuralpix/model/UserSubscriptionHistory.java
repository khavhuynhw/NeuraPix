package org.kh.neuralpix.model;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_subscription_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "subscription_id", nullable = false)
    private Long subscriptionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private SubscriptionAction actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_tier")
    private SubscriptionTier oldTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_tier")
    private SubscriptionTier newTier;

    @Column(name = "amount_charged", precision = 10, scale = 2)
    private BigDecimal amountCharged;

    @Column(name = "proration_amount", precision = 10, scale = 2)
    private BigDecimal prorationAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", insertable = false, updatable = false)
    private Subscription subscription;

    public enum SubscriptionAction{
        CREATED,
        UPGRADED,
        DOWNGRADED,
        RENEWED,
        CANCELLED,
        REACTIVATED,
        EXPIRED;
    }
}

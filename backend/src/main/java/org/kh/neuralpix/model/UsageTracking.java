package org.kh.neuralpix.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_tracking", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "usage_date", "usage_type"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type", nullable = false)
    private UsageType usageType;

    @Column(name = "usage_count", columnDefinition = "INT DEFAULT 0")
    private Integer usageCount = 0;

    @Column(name = "reset_at")
    private LocalDateTime resetAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    public enum UsageType{
        DAILY_GENERATION,
        MONTHLY_GENERATION,
        API_REQUEST,
    }
}

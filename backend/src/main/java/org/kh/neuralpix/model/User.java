package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50)
    private String username;

    @Column(unique = true, nullable = false)
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @Column(name = "password_hash", nullable = false)
    @NotBlank(message = "Password is required")
    private String passwordHash;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "INT DEFAULT 10")
    private Integer credits = 10;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier")
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean isActive = true;

    @Column(name = "email_verified", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean emailVerified = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prompt> prompts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GeneratedImage> generatedImages;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Collection> collections;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImageLike> imageLikes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Subscription> subscriptions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UsageTracking> usageTrackings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserSubscriptionHistory> subscriptionHistory;

    // Helper methods for subscription management
//    public boolean hasActiveSubscription() {
//        return subscriptions != null && subscriptions.stream()
//                .anyMatch(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE &&
//                        sub.getEndDate().isAfter(LocalDateTime.now()));
//    }
//
//    public Subscription getCurrentSubscription() {
//        return subscriptions != null ? subscriptions.stream()
//                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE &&
//                        sub.getEndDate().isAfter(LocalDateTime.now()))
//                .findFirst()
//                .orElse(null) : null;
//    }
//
//    public SubscriptionTier getEffectiveSubscriptionTier() {
//        Subscription current = getCurrentSubscription();
//        return current != null ? current.getTier() : SubscriptionTier.FREE;
//    }
}

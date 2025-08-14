package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Subscription findByUserId(Long userId);
    List<Subscription> findByStatus(Subscription.SubscriptionStatus status);
    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.status = :status")
    Subscription findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Subscription.SubscriptionStatus status);
    
    default Subscription findActiveByUserId(Long userId) {
        return findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE);
    }
    
    Optional<Subscription> findByExternalSubscriptionId(String externalSubscriptionId);
    
    // Additional methods for admin functionality
    List<Subscription> findAllByUserId(Long userId);
    
    // Count methods for statistics
    long countByStatus(Subscription.SubscriptionStatus status);
}

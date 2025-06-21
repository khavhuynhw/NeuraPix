package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUserId(Long userId);
    List<Subscription> findByStatus(Subscription.SubscriptionStatus status);
}

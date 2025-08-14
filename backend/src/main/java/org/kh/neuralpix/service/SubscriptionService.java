package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.SubscriptionDto;
import org.kh.neuralpix.dto.request.SubscriptionCancelDto;
import org.kh.neuralpix.dto.request.SubscriptionCreateRequestDto;
import org.kh.neuralpix.dto.request.SubscriptionUpdateDto;
import org.kh.neuralpix.dto.request.SubscriptionUpgradeDto;
import org.kh.neuralpix.model.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SubscriptionService {
    List<Subscription> getAll();
    Page<Subscription> getAllSubscriptions(Pageable pageable);
    Page<Subscription> searchSubscriptions(String status, String tier, String billingCycle, String autoRenew, Long userId, Pageable pageable);
    Subscription getById(Long id);
    Optional<Subscription> findById(Long id);
    Subscription getByUserId(Long userId);
    Optional<Subscription> getActiveSubscriptionByUserId(Long userId);
    void activateSubscription(Long subscriptionId);
    List<Subscription> getByStatus(Subscription.SubscriptionStatus status);
    
    // CRUD operations
    SubscriptionDto create(SubscriptionCreateRequestDto request);
    SubscriptionDto update(Long id, SubscriptionUpdateDto request);
    void delete(Long id);
    
    // Subscription actions
    void cancelSubscription(Long subscriptionId, SubscriptionCancelDto request);
    void renewSubscription(Long subscriptionId);
    void expireSubscription(Long subscriptionId);
    void suspendSubscription(Long subscriptionId, String reason);
    SubscriptionDto upgradeSubscription(Long subscriptionId, SubscriptionUpgradeDto request);
    
    // Statistics methods
    long countSubscriptionsByStatus(Subscription.SubscriptionStatus status);
    Double getTotalRevenue();
    Double getMonthlyRevenue();
    Double getAverageRevenuePerUser();
    Double getChurnRate();
    Double getGrowthRate();
    
    // Transaction related
    List<Subscription> getTransactionsBySubscriptionId(Long subscriptionId);
    Page<Subscription> getTransactionsByUserId(Long userId, Pageable pageable);
}

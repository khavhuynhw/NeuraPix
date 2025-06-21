package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.SubscriptionDto;
import org.kh.neuralpix.dto.request.SubscriptionCancelDto;
import org.kh.neuralpix.dto.request.SubscriptionCreateRequestDto;
import org.kh.neuralpix.dto.request.SubscriptionUpdateDto;
import org.kh.neuralpix.model.Subscription;

import java.util.List;
import java.util.Optional;

public interface SubscriptionService {
    List<Subscription> getAll();
    Subscription getById(Long id);
    List<Subscription> getByUserId(Long userId);
    List<Subscription> getByStatus(Subscription.SubscriptionStatus status);
    SubscriptionDto create(SubscriptionCreateRequestDto request);
    SubscriptionDto update(Long id, SubscriptionUpdateDto request);
    void cancelSubscription(Long subscriptionId, SubscriptionCancelDto request);
    void renewSubscription(Long subscriptionId);
    void expireSubscription(Long subscriptionId);
    void delete(Long id);
}

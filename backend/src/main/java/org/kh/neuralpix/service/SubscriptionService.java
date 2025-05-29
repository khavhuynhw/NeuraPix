package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Subscription;

import java.util.List;
import java.util.Optional;

public interface SubscriptionService {
    List<Subscription> getAll();
    Optional<Subscription> getById(Long id);
    List<Subscription> getByUserId(Long userId);
    List<Subscription> getByStatus(Subscription.SubscriptionStatus status);
    Subscription create(Subscription subscription);
    Subscription update(Long id, Subscription subscription);
    void delete(Long id);
}

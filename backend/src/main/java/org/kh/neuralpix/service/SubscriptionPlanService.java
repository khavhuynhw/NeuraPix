package org.kh.neuralpix.service;

import org.kh.neuralpix.model.SubscriptionPlan;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanService {
    List<SubscriptionPlan> getAll();
    Optional<SubscriptionPlan> getById(Long id);
    SubscriptionPlan create(SubscriptionPlan plan);
    SubscriptionPlan update(Long id, SubscriptionPlan plan);
    void delete(Long id);
    List<SubscriptionPlan> getActivePlans();
}

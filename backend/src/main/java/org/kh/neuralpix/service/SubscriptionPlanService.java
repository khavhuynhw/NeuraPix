package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.SubscriptionPlanDto;
import org.kh.neuralpix.dto.request.SubscriptionPlanRequestDto;
import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.model.SubscriptionTier;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanService {
    List<SubscriptionPlan> getAll();
    SubscriptionPlan getById(Long id);
    Optional<SubscriptionPlan> getByTier(SubscriptionTier tier);
    SubscriptionPlan create(SubscriptionPlanDto request);
    SubscriptionPlan update(Long id, SubscriptionPlanRequestDto request);
    void delete(Long id);
    List<SubscriptionPlan> getActivePlans();
}

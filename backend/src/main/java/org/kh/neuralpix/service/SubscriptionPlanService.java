package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.SubscriptionPlanDto;
import org.kh.neuralpix.dto.request.SubscriptionPlanRequestDto;
import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.model.enums.SubscriptionTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanService {
    List<SubscriptionPlan> getAll();
    SubscriptionPlan getById(Long id);
    Optional<SubscriptionPlan> findById(Long id);
    Optional<SubscriptionPlan> getByTier(SubscriptionTier tier);
    SubscriptionPlanDto create(SubscriptionPlanDto request);
    SubscriptionPlanDto update(Long id, SubscriptionPlanDto request);
    void delete(Long id);
    List<SubscriptionPlan> getActivePlans();
    
    // Admin functionality
    Page<SubscriptionPlan> getAllPlans(Pageable pageable);
    Page<SubscriptionPlan> searchPlans(String tier, String isActive, Pageable pageable);
    
    // Statistics methods
    long countPlansByTier(SubscriptionTier tier);
    long countActivePlans();
    long countInactivePlans();
}

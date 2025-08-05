package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.dto.SubscriptionPlanDto;
import org.kh.neuralpix.dto.request.SubscriptionPlanRequestDto;
import org.kh.neuralpix.exception.ResourceNotFoundException;
import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.model.enums.SubscriptionTier;
import org.kh.neuralpix.repository.SubscriptionPlanRepository;
import org.kh.neuralpix.service.SubscriptionPlanService;
import org.kh.neuralpix.utils.EntityMerge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;

    @Autowired
    public SubscriptionPlanServiceImpl(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public List<SubscriptionPlan> getAll() {
        return planRepository.findAll();
    }

    @Override
    public SubscriptionPlan getById(Long id) {
        return planRepository.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("SubscriptionPlan", "id", id.toString()));
    }

    @Override
    public Optional<SubscriptionPlan> getByTier(SubscriptionTier tier) {
        SubscriptionPlan plan = planRepository.findByTierAndIsActive(tier, SubscriptionPlan.IsActive.TRUE);
        return Optional.ofNullable(plan);
    }

    @Override
    public SubscriptionPlan create(SubscriptionPlanDto request) {
        if (planRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("SubscriptionPlan with name '" + request.getName() + "' already exists.");
        }
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setMonthlyPrice(request.getMonthlyPrice());
        plan.setYearlyPrice(request.getYearlyPrice());
        plan.setTier(SubscriptionTier.valueOf(request.getTier().toUpperCase()));
        plan.setIsActive(SubscriptionPlan.IsActive.valueOf(request.getIsActive().toUpperCase()));
        plan.setDailyGenerationLimit(request.getDailyGenerationLimit());
        plan.setMonthlyGenerationLimit(request.getMonthlyGenerationLimit());
        plan.setMaxImageResolution(request.getMaxImageResolution());
        plan.setPriorityProcessing(request.getPriorityProcessing());
        plan.setWatermarkRemoval(request.getWatermarkRemoval());
        plan.setCommercialLicense(request.getCommercialLicense());
        plan.setApiAccess(request.getApiAccess());
        plan.setAdvancedModels(request.getAdvancedModels());
        plan.setConcurrentGenerations(request.getConcurrentGenerations());
        plan.setSortOrder(request.getSortOrder());

        return planRepository.save(plan);
    }

    @Override
    public SubscriptionPlan update(Long id, SubscriptionPlanRequestDto request) {
        SubscriptionPlan existingPlan = planRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("SubscriptionPlan", "id", id.toString()));
        if (request.getName() != null && !existingPlan.getName().equals(request.getName()) && planRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("SubscriptionPlan with name '" + request.getName() + "' already exists for another plan.");
        }
        EntityMerge.merge(request, existingPlan);

        return planRepository.save(existingPlan);
    }

    @Override
    public void delete(Long id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("SubscriptionPlan", "id", id.toString());
        }
        SubscriptionPlan plan = planRepository.findById(id).get();
        plan.setIsActive(SubscriptionPlan.IsActive.FALSE);
        planRepository.save(plan);
    }

    @Override
    public List<SubscriptionPlan> getActivePlans() {
        return planRepository.findByIsActive(SubscriptionPlan.IsActive.TRUE);
    }
}

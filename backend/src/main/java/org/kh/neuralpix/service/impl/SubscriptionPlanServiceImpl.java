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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public Optional<SubscriptionPlan> findById(Long id) {
        return planRepository.findById(id);
    }

    @Override
    @Transactional
    public SubscriptionPlanDto create(SubscriptionPlanDto request) {
        if (planRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("SubscriptionPlan with name '" + request.getName() + "' already exists.");
        }
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setMonthlyPrice(request.getMonthlyPrice());
        plan.setYearlyPrice(request.getYearlyPrice());
        plan.setTier(SubscriptionTier.valueOf(request.getTier().toUpperCase()));
        plan.setIsActive(request.getIsActive() != null ? 
            SubscriptionPlan.IsActive.valueOf(request.getIsActive().toUpperCase()) : 
            SubscriptionPlan.IsActive.TRUE);
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
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());

        SubscriptionPlan savedPlan = planRepository.save(plan);
        return convertToDto(savedPlan);
    }

    @Override
    @Transactional
    public SubscriptionPlanDto update(Long id, SubscriptionPlanDto request) {
        SubscriptionPlan existingPlan = planRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("SubscriptionPlan", "id", id.toString()));
        if (request.getName() != null && !existingPlan.getName().equals(request.getName()) && planRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("SubscriptionPlan with name '" + request.getName() + "' already exists for another plan.");
        }
        
        // Update fields
        if (request.getName() != null) existingPlan.setName(request.getName());
        if (request.getDescription() != null) existingPlan.setDescription(request.getDescription());
        if (request.getMonthlyPrice() != null) existingPlan.setMonthlyPrice(request.getMonthlyPrice());
        if (request.getYearlyPrice() != null) existingPlan.setYearlyPrice(request.getYearlyPrice());
        if (request.getTier() != null) existingPlan.setTier(SubscriptionTier.valueOf(request.getTier().toUpperCase()));
        if (request.getIsActive() != null) existingPlan.setIsActive(SubscriptionPlan.IsActive.valueOf(request.getIsActive().toUpperCase()));
        if (request.getDailyGenerationLimit() != null) existingPlan.setDailyGenerationLimit(request.getDailyGenerationLimit());
        if (request.getMonthlyGenerationLimit() != null) existingPlan.setMonthlyGenerationLimit(request.getMonthlyGenerationLimit());
        if (request.getMaxImageResolution() != null) existingPlan.setMaxImageResolution(request.getMaxImageResolution());
        if (request.getPriorityProcessing() != null) existingPlan.setPriorityProcessing(request.getPriorityProcessing());
        if (request.getWatermarkRemoval() != null) existingPlan.setWatermarkRemoval(request.getWatermarkRemoval());
        if (request.getCommercialLicense() != null) existingPlan.setCommercialLicense(request.getCommercialLicense());
        if (request.getApiAccess() != null) existingPlan.setApiAccess(request.getApiAccess());
        if (request.getAdvancedModels() != null) existingPlan.setAdvancedModels(request.getAdvancedModels());
        if (request.getConcurrentGenerations() != null) existingPlan.setConcurrentGenerations(request.getConcurrentGenerations());
        if (request.getSortOrder() != null) existingPlan.setSortOrder(request.getSortOrder());
        
        existingPlan.setUpdatedAt(LocalDateTime.now());

        SubscriptionPlan savedPlan = planRepository.save(existingPlan);
        return convertToDto(savedPlan);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!planRepository.existsById(id)) {
            throw new ResourceNotFoundException("SubscriptionPlan", "id", id.toString());
        }
        SubscriptionPlan plan = planRepository.findById(id).get();
        plan.setIsActive(SubscriptionPlan.IsActive.FALSE);
        plan.setUpdatedAt(LocalDateTime.now());
        planRepository.save(plan);
    }

    @Override
    public List<SubscriptionPlan> getActivePlans() {
        return planRepository.findByIsActive(SubscriptionPlan.IsActive.TRUE);
    }

    @Override
    public Page<SubscriptionPlan> getAllPlans(Pageable pageable) {
        return planRepository.findAll(pageable);
    }

    @Override
    public Page<SubscriptionPlan> searchPlans(String tier, String isActive, Pageable pageable) {
        List<SubscriptionPlan> allPlans = planRepository.findAll();
        
        List<SubscriptionPlan> filteredPlans = allPlans.stream()
            .filter(plan -> {
                if (tier != null && !plan.getTier().name().equalsIgnoreCase(tier)) {
                    return false;
                }
                if (isActive != null && !plan.getIsActive().name().equalsIgnoreCase(isActive)) {
                    return false;
                }
                return true;
            })
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredPlans.size());
        
        List<SubscriptionPlan> pageContent = filteredPlans.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filteredPlans.size());
    }

    @Override
    public long countPlansByTier(SubscriptionTier tier) {
        return planRepository.countByTier(tier);
    }

    @Override
    public long countActivePlans() {
        return planRepository.countByIsActive(SubscriptionPlan.IsActive.TRUE);
    }

    @Override
    public long countInactivePlans() {
        return planRepository.countByIsActive(SubscriptionPlan.IsActive.FALSE);
    }

    private SubscriptionPlanDto convertToDto(SubscriptionPlan plan) {
        return SubscriptionPlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .tier(plan.getTier().name())
                .monthlyPrice(plan.getMonthlyPrice())
                .yearlyPrice(plan.getYearlyPrice())
                .dailyGenerationLimit(plan.getDailyGenerationLimit())
                .monthlyGenerationLimit(plan.getMonthlyGenerationLimit())
                .concurrentGenerations(plan.getConcurrentGenerations())
                .maxImageResolution(plan.getMaxImageResolution())
                .apiAccess(plan.getApiAccess())
                .commercialLicense(plan.getCommercialLicense())
                .priorityProcessing(plan.getPriorityProcessing())
                .watermarkRemoval(plan.getWatermarkRemoval())
                .advancedModels(plan.getAdvancedModels())
                .isActive(plan.getIsActive().name())
                .sortOrder(plan.getSortOrder())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}

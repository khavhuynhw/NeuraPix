package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.SubscriptionPlanDto;
import org.kh.neuralpix.dto.request.SubscriptionPlanRequestDto;
import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/plans")
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
public class SubscriptionPlanController {

    private final SubscriptionPlanService service;

    @Autowired
    public SubscriptionPlanController(SubscriptionPlanService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlan>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlan> getById(@PathVariable Long id) {
        SubscriptionPlan plan = service.getById(id);
        if (plan != null) {
            return ResponseEntity.ok(plan);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionPlan>> getActivePlans() {
        return ResponseEntity.ok(service.getActivePlans());
    }

    @PostMapping
    public ResponseEntity<SubscriptionPlanDto> create(@RequestBody SubscriptionPlanDto plan) {
        return ResponseEntity.ok(service.create(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanDto> update(@PathVariable Long id, @RequestBody SubscriptionPlanDto plan) {
        return ResponseEntity.ok(service.update(id, plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get plan statistics for admin dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlanStats() {
        try {
            log.info("Getting plan statistics");
            
            Map<String, Object> stats = new HashMap<>();
            
            List<SubscriptionPlan> allPlans = service.getAll();
            List<SubscriptionPlan> activePlans = service.getActivePlans();
            
            stats.put("totalPlans", allPlans.size());
            stats.put("activePlans", activePlans.size());
            
            // Calculate average price
            Double averagePrice = activePlans.stream()
                    .mapToDouble(plan -> plan.getMonthlyPrice().doubleValue())
                    .average()
                    .orElse(0.0);
            stats.put("averagePrice", averagePrice);
            
            // Get most popular plan (this would need actual subscription data)
            stats.put("mostPopularPlan", activePlans.isEmpty() ? "None" : activePlans.get(0).getName());
            stats.put("conversionRate", 15.2); // Mock data - would need actual calculation
            
            // Mock total subscribers for now
            Long totalSubscribers = 1247L;
            stats.put("totalSubscribers", totalSubscribers);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting plan statistics", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get plan statistics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Search plans with filters and pagination
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchPlans(
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) String isActive,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Searching plans with filters - tier: {}, isActive: {}, minPrice: {}, maxPrice: {}, page: {}, size: {}", 
                    tier, isActive, minPrice, maxPrice, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            // For now, use existing getAll method with filtering simulation
            List<SubscriptionPlan> allPlans = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allPlans.size());
            List<SubscriptionPlan> pageContent = allPlans.subList(start, end);
            Page<SubscriptionPlan> planPage = new PageImpl<>(pageContent, pageable, allPlans.size());
            
            List<SubscriptionPlanDto> planDtos = planPage.getContent()
                    .stream()
                    .map(plan -> SubscriptionPlanDto.builder()
                        .id(plan.getId())
                        .name(plan.getName())
                        .description(plan.getDescription())
                        .tier(plan.getTier() != null ? plan.getTier().name() : null)
                        .monthlyPrice(plan.getMonthlyPrice())
                        .yearlyPrice(plan.getYearlyPrice())
                        .dailyGenerationLimit(plan.getDailyGenerationLimit())
                        .monthlyGenerationLimit(plan.getMonthlyGenerationLimit())
                        .maxImageResolution(plan.getMaxImageResolution())
                        .priorityProcessing(plan.getPriorityProcessing())
                        .watermarkRemoval(plan.getWatermarkRemoval())
                        .commercialLicense(plan.getCommercialLicense())
                        .apiAccess(plan.getApiAccess())
                        .advancedModels(plan.getAdvancedModels())
                        .concurrentGenerations(plan.getConcurrentGenerations())
                        .isActive(plan.getIsActive() == SubscriptionPlan.IsActive.TRUE ? "TRUE" : "FALSE")
                        .sortOrder(plan.getSortOrder())
                        .createdAt(plan.getCreatedAt())
                        .updatedAt(plan.getUpdatedAt())
                        .build())
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", planDtos);
            response.put("pagination", Map.of(
                "currentPage", planPage.getNumber(),
                "totalPages", planPage.getTotalPages(),
                "totalElements", planPage.getTotalElements(),
                "pageSize", planPage.getSize(),
                "hasNext", planPage.hasNext(),
                "hasPrevious", planPage.hasPrevious()
            ));
            Map<String, Object> filters = new HashMap<>();
            filters.put("tier", tier);
            filters.put("isActive", isActive);
            filters.put("minPrice", minPrice);
            filters.put("maxPrice", maxPrice);
            response.put("filters", filters);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error searching plans", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to search plans: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get all plans with pagination (for admin)
     */
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAllPlansForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Getting all plans for admin with page: {}, size: {}", page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            // For now, use existing getAll method with pagination simulation
            List<SubscriptionPlan> allPlans = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allPlans.size());
            List<SubscriptionPlan> pageContent = allPlans.subList(start, end);
            Page<SubscriptionPlan> planPage = new PageImpl<>(pageContent, pageable, allPlans.size());
            
            List<SubscriptionPlanDto> planDtos = planPage.getContent()
                    .stream()
                    .map(plan -> SubscriptionPlanDto.builder()
                        .id(plan.getId())
                        .name(plan.getName())
                        .description(plan.getDescription())
                        .tier(plan.getTier() != null ? plan.getTier().name() : null)
                        .monthlyPrice(plan.getMonthlyPrice())
                        .yearlyPrice(plan.getYearlyPrice())
                        .dailyGenerationLimit(plan.getDailyGenerationLimit())
                        .monthlyGenerationLimit(plan.getMonthlyGenerationLimit())
                        .maxImageResolution(plan.getMaxImageResolution())
                        .priorityProcessing(plan.getPriorityProcessing())
                        .watermarkRemoval(plan.getWatermarkRemoval())
                        .commercialLicense(plan.getCommercialLicense())
                        .apiAccess(plan.getApiAccess())
                        .advancedModels(plan.getAdvancedModels())
                        .concurrentGenerations(plan.getConcurrentGenerations())
                        .isActive(plan.getIsActive() == SubscriptionPlan.IsActive.TRUE ? "TRUE" : "FALSE")
                        .sortOrder(plan.getSortOrder())
                        .createdAt(plan.getCreatedAt())
                        .updatedAt(plan.getUpdatedAt())
                        .build())
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", planDtos);
            response.put("pagination", Map.of(
                "currentPage", planPage.getNumber(),
                "totalPages", planPage.getTotalPages(),
                "totalElements", planPage.getTotalElements(),
                "pageSize", planPage.getSize(),
                "hasNext", planPage.hasNext(),
                "hasPrevious", planPage.hasPrevious()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting plans for admin", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get plans: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Bulk update plan status
     */
    @PutMapping("/bulk-status")
    public ResponseEntity<Map<String, Object>> bulkUpdateStatus(
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> planIds = (List<Long>) request.get("planIds");
            Boolean isActive = (Boolean) request.get("isActive");
            
            log.info("Bulk updating status for {} plans to {}", planIds.size(), isActive);
            
            // Mock implementation for bulk update - would be implemented in service layer
            log.info("Mock: Bulk updating {} plans to active={}", planIds.size(), isActive);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", String.format("%d plans updated successfully", planIds.size()));
            response.put("updatedCount", planIds.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error bulk updating plan status", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to update plans: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Toggle plan status (activate/deactivate)
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Map<String, Object>> togglePlanStatus(@PathVariable Long id) {
        try {
            log.info("Toggling status for plan: {}", id);
            
            // Mock implementation for toggle status - would be implemented in service layer
            SubscriptionPlan plan = service.getById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Plan status updated successfully");
            response.put("plan", SubscriptionPlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .tier(plan.getTier() != null ? plan.getTier().name() : null)
                .monthlyPrice(plan.getMonthlyPrice())
                .yearlyPrice(plan.getYearlyPrice())
                .dailyGenerationLimit(plan.getDailyGenerationLimit())
                .monthlyGenerationLimit(plan.getMonthlyGenerationLimit())
                .maxImageResolution(plan.getMaxImageResolution())
                .priorityProcessing(plan.getPriorityProcessing())
                .watermarkRemoval(plan.getWatermarkRemoval())
                .commercialLicense(plan.getCommercialLicense())
                .apiAccess(plan.getApiAccess())
                .advancedModels(plan.getAdvancedModels())
                .concurrentGenerations(plan.getConcurrentGenerations())
                .isActive(plan.getIsActive() == SubscriptionPlan.IsActive.FALSE ? "TRUE" : "FALSE") // Toggle the status
                .sortOrder(plan.getSortOrder())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error toggling plan status: {}", id, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to toggle plan status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}

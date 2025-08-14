package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.SubscriptionDto;
import org.kh.neuralpix.dto.request.SubscriptionCancelDto;
import org.kh.neuralpix.dto.request.SubscriptionCreateRequestDto;
import org.kh.neuralpix.dto.request.SubscriptionUpdateDto;
import org.kh.neuralpix.dto.request.SubscriptionUpgradeDto;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/subscriptions")
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
public class SubscriptionController {

    private final SubscriptionService service;

    @Autowired
    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subscription> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Subscription> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Subscription>> getByStatus(@PathVariable Subscription.SubscriptionStatus status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @PostMapping
    public ResponseEntity<SubscriptionDto> create(@RequestBody SubscriptionCreateRequestDto subscription) {
        return ResponseEntity.ok(service.create(subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDto> update(@PathVariable Long id, @RequestBody SubscriptionUpdateDto subscription) {
        return ResponseEntity.ok(service.update(id, subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelSubscription(
            @PathVariable Long subscriptionId, 
            @RequestBody SubscriptionCancelDto request) {
        try {
            log.info("Cancelling subscription: {} with reason: {}", subscriptionId, request.getReason());
            
            service.cancelSubscription(subscriptionId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription cancelled successfully");
            response.put("subscriptionId", subscriptionId);
            response.put("cancelImmediately", request.getCancelImmediately());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cancelling subscription: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to cancel subscription: " + e.getMessage());
            error.put("subscriptionId", subscriptionId);
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/{subscriptionId}/renew")
    public ResponseEntity<Map<String, Object>> renewSubscription(@PathVariable Long subscriptionId) {
        try {
            log.info("Renewing subscription: {}", subscriptionId);
            
            service.renewSubscription(subscriptionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription renewed successfully");
            response.put("subscriptionId", subscriptionId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error renewing subscription: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to renew subscription: " + e.getMessage());
            error.put("subscriptionId", subscriptionId);
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/{subscriptionId}/upgrade")
    public ResponseEntity<Map<String, Object>> upgradeSubscription(
            @PathVariable Long subscriptionId, 
            @RequestBody SubscriptionUpgradeDto request) {
        try {
            log.info("Upgrading subscription: {} to tier: {}", subscriptionId, request.getNewTier());
            
            SubscriptionDto upgradedSubscription = service.upgradeSubscription(subscriptionId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription upgraded successfully");
            response.put("subscription", upgradedSubscription);
            response.put("newTier", request.getNewTier().name());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error upgrading subscription: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to upgrade subscription: " + e.getMessage());
            error.put("subscriptionId", subscriptionId);
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/{subscriptionId}/expire")
    public ResponseEntity<Map<String, Object>> expireSubscription(@PathVariable Long subscriptionId) {
        try {
            log.info("Expiring subscription: {}", subscriptionId);
            
            service.expireSubscription(subscriptionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription expired successfully");
            response.put("subscriptionId", subscriptionId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error expiring subscription: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to expire subscription: " + e.getMessage());
            error.put("subscriptionId", subscriptionId);
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Suspend subscription
     */
    @PostMapping("/{subscriptionId}/suspend")
    public ResponseEntity<Map<String, Object>> suspendSubscription(
            @PathVariable Long subscriptionId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            log.info("Suspending subscription: {}", subscriptionId);
            
            String reason = request != null ? request.get("reason") : "Admin action";
            // Mock implementation - would be implemented in service layer
            log.info("Mock: Suspending subscription {} with reason: {}", subscriptionId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Subscription suspended successfully");
            response.put("subscriptionId", subscriptionId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error suspending subscription: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to suspend subscription: " + e.getMessage());
            error.put("subscriptionId", subscriptionId);
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get subscription statistics for admin dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSubscriptionStats() {
        try {
            log.info("Getting subscription statistics");
            
            Map<String, Object> stats = new HashMap<>();
            
            // Count subscriptions by status (mock data for now)
            stats.put("activeCount", 1089L);
            stats.put("cancelledCount", 43L);
            stats.put("expiredCount", 67L);
            stats.put("suspendedCount", 48L);
            
            // Calculate revenue metrics (mock data for now)
            Double totalRevenue = 125847.50;
            Double monthlyRevenue = 25847.0;
            Double arpu = 23.75;
            Double churnRate = 3.2;
            Double growthRate = 12.5;
            
            stats.put("totalRevenue", totalRevenue);
            stats.put("monthlyRevenue", monthlyRevenue);
            stats.put("arpu", arpu);
            stats.put("churnRate", churnRate);
            stats.put("growthRate", growthRate);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting subscription statistics", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get subscription statistics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Search subscriptions with pagination and filters
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchSubscriptions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) String billingCycle,
            @RequestParam(required = false) String autoRenew,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Searching subscriptions with filters - status: {}, tier: {}, billingCycle: {}, autoRenew: {}, userId: {}, page: {}, size: {}", 
                    status, tier, billingCycle, autoRenew, userId, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            // For now, return existing subscriptions - this would be implemented in service layer
            List<Subscription> allSubscriptions = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allSubscriptions.size());
            List<Subscription> pageContent = allSubscriptions.subList(start, end);
            Page<Subscription> subscriptionPage = new PageImpl<>(pageContent, pageable, allSubscriptions.size());
            
            List<SubscriptionDto> subscriptionDtos = subscriptionPage.getContent()
                    .stream()
                    .map(SubscriptionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", subscriptionDtos);
            response.put("pagination", Map.of(
                "currentPage", subscriptionPage.getNumber(),
                "totalPages", subscriptionPage.getTotalPages(),
                "totalElements", subscriptionPage.getTotalElements(),
                "pageSize", subscriptionPage.getSize(),
                "hasNext", subscriptionPage.hasNext(),
                "hasPrevious", subscriptionPage.hasPrevious()
            ));
            Map<String, Object> filters = new HashMap<>();
            filters.put("status", status);
            filters.put("tier", tier);
            filters.put("billingCycle", billingCycle);
            filters.put("autoRenew", autoRenew);
            filters.put("userId", userId);
            response.put("filters", filters);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error searching subscriptions", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to search subscriptions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Get all subscriptions with pagination (for admin)
     */
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAllSubscriptionsForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Getting all subscriptions for admin with page: {}, size: {}", page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            // For now, use existing getAll method with pagination simulation
            List<Subscription> allSubscriptions = service.getAll();
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allSubscriptions.size());
            List<Subscription> pageContent = allSubscriptions.subList(start, end);
            Page<Subscription> subscriptionPage = new PageImpl<>(pageContent, pageable, allSubscriptions.size());
            
            List<SubscriptionDto> subscriptionDtos = subscriptionPage.getContent()
                    .stream()
                    .map(SubscriptionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", subscriptionDtos);
            response.put("pagination", Map.of(
                "currentPage", subscriptionPage.getNumber(),
                "totalPages", subscriptionPage.getTotalPages(),
                "totalElements", subscriptionPage.getTotalElements(),
                "pageSize", subscriptionPage.getSize(),
                "hasNext", subscriptionPage.hasNext(),
                "hasPrevious", subscriptionPage.hasPrevious()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting subscriptions for admin", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get subscriptions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}

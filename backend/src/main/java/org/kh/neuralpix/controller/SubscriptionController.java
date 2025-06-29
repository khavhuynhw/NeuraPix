package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.SubscriptionDto;
import org.kh.neuralpix.dto.request.SubscriptionCancelDto;
import org.kh.neuralpix.dto.request.SubscriptionCreateRequestDto;
import org.kh.neuralpix.dto.request.SubscriptionUpdateDto;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
@Slf4j
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
}

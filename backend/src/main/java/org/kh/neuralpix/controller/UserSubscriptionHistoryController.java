package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.UserSubscriptionHistory;
import org.kh.neuralpix.service.UserSubscriptionHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-subscription-history")
public class UserSubscriptionHistoryController {

    private final UserSubscriptionHistoryService service;

    @Autowired
    public UserSubscriptionHistoryController(UserSubscriptionHistoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UserSubscriptionHistory>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserSubscriptionHistory> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<UserSubscriptionHistory>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @GetMapping("/by-subscription/{subscriptionId}")
    public ResponseEntity<List<UserSubscriptionHistory>> getBySubscriptionId(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(service.getBySubscriptionId(subscriptionId));
    }

    @PostMapping
    public ResponseEntity<UserSubscriptionHistory> create(@RequestBody UserSubscriptionHistory history) {
        return ResponseEntity.ok(service.create(history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

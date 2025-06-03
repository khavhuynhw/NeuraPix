package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
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
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Subscription>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Subscription>> getByStatus(@PathVariable Subscription.SubscriptionStatus status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @PostMapping
    public ResponseEntity<Subscription> create(@RequestBody Subscription subscription) {
        return ResponseEntity.ok(service.create(subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> update(@PathVariable Long id, @RequestBody Subscription subscription) {
        return ResponseEntity.ok(service.update(id, subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

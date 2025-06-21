package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-plans")
public class SubscriptionPlanController {

//    private final SubscriptionPlanService service;
//
//    @Autowired
//    public SubscriptionPlanController(SubscriptionPlanService service) {
//        this.service = service;
//    }
//
//    @GetMapping
//    public ResponseEntity<List<SubscriptionPlan>> getAll() {
//        return ResponseEntity.ok(service.getAll());
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<SubscriptionPlan> getById(@PathVariable Long id) {
//        return service.getById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    @GetMapping("/active")
//    public ResponseEntity<List<SubscriptionPlan>> getActivePlans() {
//        return ResponseEntity.ok(service.getActivePlans());
//    }
//
//    @PostMapping
//    public ResponseEntity<SubscriptionPlan> create(@RequestBody SubscriptionPlan plan) {
//        return ResponseEntity.ok(service.create(plan));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<SubscriptionPlan> update(@PathVariable Long id, @RequestBody SubscriptionPlan plan) {
//        return ResponseEntity.ok(service.update(id, plan));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        service.delete(id);
//        return ResponseEntity.noContent().build();
//    }
}

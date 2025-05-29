package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.kh.neuralpix.service.UsageTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/usage-tracking")
public class UsageTrackingController {

    private final UsageTrackingService service;

    @Autowired
    public UsageTrackingController(UsageTrackingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UsageTracking>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsageTracking> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-user-date")
    public ResponseEntity<UsageTracking> getByUserDateType(
            @RequestParam Long userId,
            @RequestParam LocalDate date,
            @RequestParam UsageType usageType) {
        return service.getByUserDateType(userId, date, usageType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UsageTracking> create(@RequestBody UsageTracking usageTracking) {
        return ResponseEntity.ok(service.create(usageTracking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsageTracking> update(@PathVariable Long id, @RequestBody UsageTracking usageTracking) {
        return ResponseEntity.ok(service.update(id, usageTracking));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

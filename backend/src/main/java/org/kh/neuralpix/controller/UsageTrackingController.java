package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.response.UsageTrackingResponseDto;
import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.kh.neuralpix.service.UsageTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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

    // New endpoints for enhanced usage tracking

    @PostMapping("/track-generation/{userId}")
    public ResponseEntity<String> trackImageGeneration(@PathVariable Long userId) {
        service.trackImageGeneration(userId);
        return ResponseEntity.ok("Image generation tracked successfully");
    }

    @GetMapping("/can-generate/{userId}")
    public ResponseEntity<Map<String, Object>> canGenerateImage(@PathVariable Long userId) {
        boolean canGenerate = service.canGenerateImage(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("canGenerate", canGenerate);
        response.put("remainingDaily", service.getRemainingDailyGenerations(userId));
        response.put("remainingMonthly", service.getRemainingMonthlyGenerations(userId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/daily-usage/{userId}")
    public ResponseEntity<Map<String, Object>> getDailyUsage(@PathVariable Long userId) {
        LocalDate today = LocalDate.now();
        int usage = service.getDailyUsageCount(userId, today);
        int remaining = service.getRemainingDailyGenerations(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("date", today);
        response.put("usage", usage);
        response.put("remaining", remaining);
        response.put("hasExceededLimit", service.hasExceededDailyLimit(userId));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-usage/{userId}")
    public ResponseEntity<Map<String, Object>> getMonthlyUsage(@PathVariable Long userId) {
        LocalDate today = LocalDate.now();
        int usage = service.getMonthlyUsageCount(userId, today);
        int remaining = service.getRemainingMonthlyGenerations(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("year", today.getYear());
        response.put("month", today.getMonthValue());
        response.put("usage", usage);
        response.put("remaining", remaining);
        response.put("hasExceededLimit", service.hasExceededMonthlyLimit(userId));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-daily/{userId}")
    public ResponseEntity<String> resetDailyUsage(@PathVariable Long userId) {
        service.resetDailyUsage(userId);
        return ResponseEntity.ok("Daily usage reset successfully");
    }

    @PostMapping("/reset-monthly/{userId}")
    public ResponseEntity<String> resetMonthlyUsage(@PathVariable Long userId) {
        service.resetMonthlyUsage(userId);
        return ResponseEntity.ok("Monthly usage reset successfully");
    }

    @GetMapping("/limits/{userId}")
    public ResponseEntity<Map<String, Object>> getUserLimits(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("hasExceededDailyLimit", service.hasExceededDailyLimit(userId));
        response.put("hasExceededMonthlyLimit", service.hasExceededMonthlyLimit(userId));
        response.put("remainingDailyGenerations", service.getRemainingDailyGenerations(userId));
        response.put("remainingMonthlyGenerations", service.getRemainingMonthlyGenerations(userId));
        response.put("canGenerate", service.canGenerateImage(userId));
        
        return ResponseEntity.ok(response);
    }

    // Comprehensive usage information endpoint
    @GetMapping("/comprehensive/{userId}")
    public ResponseEntity<UsageTrackingResponseDto> getComprehensiveUsageInfo(@PathVariable Long userId) {
        UsageTrackingResponseDto usageInfo = service.getComprehensiveUsageInfo(userId);
        return ResponseEntity.ok(usageInfo);
    }
}

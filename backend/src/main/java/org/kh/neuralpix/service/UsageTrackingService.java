package org.kh.neuralpix.service;

import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UsageTrackingService {
    List<UsageTracking> getAll();
    Optional<UsageTracking> getById(Long id);
    Optional<UsageTracking> getByUserDateType(Long userId, LocalDate date, UsageType usageType);
    UsageTracking create(UsageTracking usageTracking);
    UsageTracking update(Long id, UsageTracking usageTracking);
    void delete(Long id);
}

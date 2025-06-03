package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.kh.neuralpix.repository.UsageTrackingRepository;
import org.kh.neuralpix.service.UsageTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UsageTrackingServiceImpl implements UsageTrackingService {

    private final UsageTrackingRepository repository;

    @Autowired
    public UsageTrackingServiceImpl(UsageTrackingRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<UsageTracking> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<UsageTracking> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<UsageTracking> getByUserDateType(Long userId, LocalDate date, UsageType usageType) {
        return repository.findByUserIdAndUsageDateAndUsageType(userId, date, usageType);
    }

    @Override
    public UsageTracking create(UsageTracking usageTracking) {
        return repository.save(usageTracking);
    }

    @Override
    public UsageTracking update(Long id, UsageTracking updated) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("UsageTracking with id " + id + " not found");
        }
        updated.setId(id);
        return repository.save(updated);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

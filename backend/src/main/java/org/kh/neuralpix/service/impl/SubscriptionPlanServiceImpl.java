package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.SubscriptionPlan;
import org.kh.neuralpix.repository.SubscriptionPlanRepository;
import org.kh.neuralpix.service.SubscriptionPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository repository;

    @Autowired
    public SubscriptionPlanServiceImpl(SubscriptionPlanRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SubscriptionPlan> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<SubscriptionPlan> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public SubscriptionPlan create(SubscriptionPlan plan) {
        return repository.save(plan);
    }

    @Override
    public SubscriptionPlan update(Long id, SubscriptionPlan plan) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("SubscriptionPlan not found with id: " + id);
        }
        plan.setId(id);
        return repository.save(plan);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<SubscriptionPlan> getActivePlans() {
        return repository.findByIsActiveTrue();
    }
}

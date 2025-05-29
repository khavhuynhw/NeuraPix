package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.repository.SubscriptionRepository;
import org.kh.neuralpix.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository repository;

    @Autowired
    public SubscriptionServiceImpl(SubscriptionRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Subscription> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Subscription> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Subscription> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<Subscription> getByStatus(Subscription.SubscriptionStatus status) {
        return repository.findByStatus(status);
    }

    @Override
    public Subscription create(Subscription subscription) {
        return repository.save(subscription);
    }

    @Override
    public Subscription update(Long id, Subscription subscription) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Subscription not found with id: " + id);
        }
        subscription.setId(id);
        return repository.save(subscription);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

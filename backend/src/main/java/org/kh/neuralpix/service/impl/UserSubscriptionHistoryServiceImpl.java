package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.UserSubscriptionHistory;
import org.kh.neuralpix.repository.UserSubscriptionHistoryRepository;
import org.kh.neuralpix.service.UserSubscriptionHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserSubscriptionHistoryServiceImpl implements UserSubscriptionHistoryService {

    private final UserSubscriptionHistoryRepository repository;

    @Autowired
    public UserSubscriptionHistoryServiceImpl(UserSubscriptionHistoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<UserSubscriptionHistory> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<UserSubscriptionHistory> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<UserSubscriptionHistory> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<UserSubscriptionHistory> getBySubscriptionId(Long subscriptionId) {
        return repository.findBySubscriptionId(subscriptionId);
    }

    @Override
    public UserSubscriptionHistory create(UserSubscriptionHistory history) {
        return repository.save(history);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}

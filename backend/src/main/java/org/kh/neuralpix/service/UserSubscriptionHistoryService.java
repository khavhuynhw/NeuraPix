package org.kh.neuralpix.service;

import org.kh.neuralpix.model.UserSubscriptionHistory;

import java.util.List;
import java.util.Optional;

public interface UserSubscriptionHistoryService {
    List<UserSubscriptionHistory> getAll();
    Optional<UserSubscriptionHistory> getById(Long id);
    List<UserSubscriptionHistory> getByUserId(Long userId);
    List<UserSubscriptionHistory> getBySubscriptionId(Long subscriptionId);
    UserSubscriptionHistory create(UserSubscriptionHistory history);
    void delete(Long id);
}

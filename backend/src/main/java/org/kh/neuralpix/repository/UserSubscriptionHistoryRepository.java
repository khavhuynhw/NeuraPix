package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.UserSubscriptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSubscriptionHistoryRepository extends JpaRepository<UserSubscriptionHistory, Long> {
    List<UserSubscriptionHistory> findByUserId(Long userId);
    List<UserSubscriptionHistory> findBySubscriptionId(Long subscriptionId);
}

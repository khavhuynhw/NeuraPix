package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByIsActiveTrue();
    List<SubscriptionPlan> findByTier(SubscriptionPlan tier);
}

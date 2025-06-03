package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTracking, Long> {
    Optional<UsageTracking> findByUserIdAndUsageDateAndUsageType(Long userId, LocalDate usageDate, UsageType usageType);
}

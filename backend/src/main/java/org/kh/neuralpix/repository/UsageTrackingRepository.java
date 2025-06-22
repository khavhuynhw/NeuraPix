package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.UsageTracking;
import org.kh.neuralpix.model.UsageTracking.UsageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTracking, Long> {
    Optional<UsageTracking> findByUserIdAndUsageDateAndUsageType(Long userId, LocalDate usageDate, UsageType usageType);
    
    List<UsageTracking> findByUserIdAndUsageType(Long userId, UsageType usageType);
    
    List<UsageTracking> findByUserIdAndUsageDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(ut.usageCount), 0) FROM UsageTracking ut " +
           "WHERE ut.userId = :userId AND ut.usageDate = :date AND ut.usageType = :usageType")
    Integer sumUsageCountByUserIdAndDateAndType(@Param("userId") Long userId, 
                                               @Param("date") LocalDate date, 
                                               @Param("usageType") UsageType usageType);
    
    @Query("SELECT COALESCE(SUM(ut.usageCount), 0) FROM UsageTracking ut " +
           "WHERE ut.userId = :userId AND ut.usageType = :usageType " +
           "AND YEAR(ut.usageDate) = :year AND MONTH(ut.usageDate) = :month")
    Integer sumMonthlyUsageByUserIdAndType(@Param("userId") Long userId, 
                                          @Param("usageType") UsageType usageType,
                                          @Param("year") int year, 
                                          @Param("month") int month);
}

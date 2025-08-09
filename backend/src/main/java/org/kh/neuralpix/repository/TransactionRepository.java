package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Tìm transaction theo order code
     */
    Optional<Transaction> findByOrderCode(Long orderCode);

    /**
     * Kiểm tra order code đã tồn tại chưa
     */
    boolean existsByOrderCode(Long orderCode);

    /**
     * Tìm tất cả transactions của một user
     */
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Tìm transactions của user với phân trang
     */
    Page<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Tìm transactions theo subscription ID
     */
    List<Transaction> findBySubscriptionIdOrderByCreatedAtDesc(Long subscriptionId);

    /**
     * Tìm transactions theo status
     */
    List<Transaction> findByStatusOrderByCreatedAtDesc(Transaction.TransactionStatus status);

    /**
     * Tìm transactions theo type
     */
    List<Transaction> findByTypeOrderByCreatedAtDesc(Transaction.TransactionType type);

    /**
     * Tìm transactions theo user và status
     */
    List<Transaction> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Transaction.TransactionStatus status);

    /**
     * Tìm transactions theo user và type
     */
    List<Transaction> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Transaction.TransactionType type);

    /**
     * Tìm transactions trong khoảng thời gian
     */
    @Query("SELECT t FROM Transaction t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm transactions của user trong khoảng thời gian
     */
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                                    @Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm transactions pending quá hạn (để auto cancel)
     */
    @Query("SELECT t FROM Transaction t WHERE t.status = 'PENDING' AND t.createdAt < :expiredTime")
    List<Transaction> findExpiredPendingTransactions(@Param("expiredTime") LocalDateTime expiredTime);

    /**
     * Thống kê tổng số tiền theo status
     */
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = :status")
    Double getTotalAmountByStatus(@Param("status") Transaction.TransactionStatus status);

    /**
     * Thống kê tổng số tiền của user theo status
     */
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.userId = :userId AND t.status = :status")
    Double getTotalAmountByUserIdAndStatus(@Param("userId") Long userId, 
                                         @Param("status") Transaction.TransactionStatus status);

    /**
     * Đếm số transactions theo status
     */
    long countByStatus(Transaction.TransactionStatus status);

    /**
     * Đếm số transactions của user theo status
     */
    long countByUserIdAndStatus(Long userId, Transaction.TransactionStatus status);

    /**
     * Tìm transaction gần nhất của user theo type
     */
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.type = :type ORDER BY t.createdAt DESC LIMIT 1")
    Optional<Transaction> findLatestTransactionByUserIdAndType(@Param("userId") Long userId, 
                                                             @Param("type") Transaction.TransactionType type);

    /**
     * Tìm transactions theo payment provider
     */
    List<Transaction> findByPaymentProviderOrderByCreatedAtDesc(String paymentProvider);

    /**
     * Tìm transactions thành công trong tháng hiện tại
     */
    @Query("SELECT t FROM Transaction t WHERE t.status = 'PAID' AND YEAR(t.updatedAt) = :year AND MONTH(t.updatedAt) = :month")
    List<Transaction> findPaidTransactionsByMonth(@Param("year") int year, @Param("month") int month);

    /**
     * Thống kê doanh thu theo tháng
     */
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = 'PAID' AND YEAR(t.updatedAt) = :year AND MONTH(t.updatedAt) = :month")
    Double getRevenueByMonth(@Param("year") int year, @Param("month") int month);
}
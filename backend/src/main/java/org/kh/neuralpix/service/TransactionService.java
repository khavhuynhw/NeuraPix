package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionService {

    /**
     * Tạo transaction mới
     */
    Transaction createTransaction(Transaction transaction);

    /**
     * Tạo transaction cho PayOS payment
     */
    Transaction createPayOSTransaction(Long orderCode, Long userId, Long subscriptionId, 
                                     BigDecimal amount, Transaction.TransactionType type, 
                                     String description, String buyerEmail);

    /**
     * Cập nhật transaction
     */
    Transaction updateTransaction(Transaction transaction);

    /**
     * Tìm transaction theo ID
     */
    Optional<Transaction> findById(Long id);

    /**
     * Tìm transaction theo order code
     */
    Optional<Transaction> findByOrderCode(Long orderCode);

    /**
     * Lấy tất cả transactions của user
     */
    List<Transaction> getTransactionsByUserId(Long userId);

    /**
     * Lấy transactions của user với phân trang
     */
    Page<Transaction> getTransactionsByUserId(Long userId, Pageable pageable);

    /**
     * Lấy transactions theo subscription
     */
    List<Transaction> getTransactionsBySubscriptionId(Long subscriptionId);

    /**
     * Lấy transactions theo status
     */
    List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status);

    /**
     * Lấy transactions theo type
     */
    List<Transaction> getTransactionsByType(Transaction.TransactionType type);

    /**
     * Đánh dấu transaction là đã thanh toán
     */
    Transaction markTransactionAsPaid(Long orderCode, String paymentMethod);

    /**
     * Đánh dấu transaction là bị hủy
     */
    Transaction markTransactionAsCancelled(Long orderCode);

    /**
     * Đánh dấu transaction là thất bại
     */
    Transaction markTransactionAsFailed(Long orderCode);

    /**
     * Kiểm tra order code đã tồn tại chưa
     */
    boolean existsByOrderCode(Long orderCode);

    /**
     * Auto cancel các transactions pending quá hạn
     */
    void cancelExpiredPendingTransactions(int expiredHours);

    /**
     * Thống kê tổng doanh thu theo status
     */
    Double getTotalRevenueByStatus(Transaction.TransactionStatus status);

    /**
     * Thống kê doanh thu của user
     */
    Double getUserTotalRevenue(Long userId, Transaction.TransactionStatus status);

    /**
     * Đếm số transactions theo status
     */
    long countTransactionsByStatus(Transaction.TransactionStatus status);

    /**
     * Tìm transaction gần nhất của user theo type
     */
    Optional<Transaction> findLatestTransactionByUserAndType(Long userId, Transaction.TransactionType type);

    /**
     * Lấy transactions trong khoảng thời gian
     */
    List<Transaction> getTransactionsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Lấy transactions của user trong khoảng thời gian
     */
    List<Transaction> getUserTransactionsBetweenDates(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Thống kê doanh thu theo tháng
     */
    Double getMonthlyRevenue(int year, int month);

    /**
     * Lấy transactions thành công trong tháng
     */
    List<Transaction> getPaidTransactionsByMonth(int year, int month);

    /**
     * Xóa transaction (soft delete bằng cách đánh dấu status)
     */
    void deleteTransaction(Long id);

    /**
     * Restore transaction đã xóa
     */
    void restoreTransaction(Long id);
}
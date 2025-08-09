package org.kh.neuralpix.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.repository.TransactionRepository;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating new transaction with order code: {}", transaction.getOrderCode());
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction createPayOSTransaction(Long orderCode, Long userId, Long subscriptionId,
                                            BigDecimal amount, Transaction.TransactionType type,
                                            String description, String buyerEmail) {
        log.info("Creating PayOS transaction - OrderCode: {}, UserId: {}, Amount: {}", 
                orderCode, userId, amount);

        Transaction transaction = Transaction.builder()
                .orderCode(orderCode)
                .userId(userId)
                .subscriptionId(subscriptionId)
                .amount(amount)
                .currency("VND")
                .status(Transaction.TransactionStatus.PENDING)
                .type(type)
                .paymentProvider("PAYOS")
                .description(description)
                .buyerEmail(buyerEmail)
                .build();

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction updateTransaction(Transaction transaction) {
        log.info("Updating transaction with ID: {}", transaction.getId());
        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Transaction> findById(Long id) {
        return transactionRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Transaction> findByOrderCode(Long orderCode) {
        return transactionRepository.findByOrderCode(orderCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Transaction> getTransactionsByUserId(Long userId, Pageable pageable) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsBySubscriptionId(Long subscriptionId) {
        return transactionRepository.findBySubscriptionIdOrderByCreatedAtDesc(subscriptionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByStatus(Transaction.TransactionStatus status) {
        return transactionRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsByType(Transaction.TransactionType type) {
        return transactionRepository.findByTypeOrderByCreatedAtDesc(type);
    }

    @Override
    public Transaction markTransactionAsPaid(Long orderCode, String paymentMethod) {
        log.info("Marking transaction as paid - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        transaction.markAsPaid();
        transaction.setPaymentMethod(paymentMethod);

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction markTransactionAsCancelled(Long orderCode) {
        log.info("Marking transaction as cancelled - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        transaction.markAsCancelled(null);

        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction markTransactionAsFailed(Long orderCode) {
        log.info("Marking transaction as failed - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        transaction.markAsFailed(null);

        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByOrderCode(Long orderCode) {
        return transactionRepository.existsByOrderCode(orderCode);
    }

    @Override
    public void cancelExpiredPendingTransactions(int expiredHours) {
        log.info("Cancelling expired pending transactions older than {} hours", expiredHours);
        
        LocalDateTime expiredTime = LocalDateTime.now().minusHours(expiredHours);
        List<Transaction> expiredTransactions = transactionRepository.findExpiredPendingTransactions(expiredTime);
        
        for (Transaction transaction : expiredTransactions) {
            transaction.markAsCancelled("Expired - automatically cancelled");
            transactionRepository.save(transaction);
            log.info("Cancelled expired transaction with order code: {}", transaction.getOrderCode());
        }
        
        log.info("Cancelled {} expired transactions", expiredTransactions.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalRevenueByStatus(Transaction.TransactionStatus status) {
        Double revenue = transactionRepository.getTotalAmountByStatus(status);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public Double getUserTotalRevenue(Long userId, Transaction.TransactionStatus status) {
        Double revenue = transactionRepository.getTotalAmountByUserIdAndStatus(userId, status);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public long countTransactionsByStatus(Transaction.TransactionStatus status) {
        return transactionRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Transaction> findLatestTransactionByUserAndType(Long userId, Transaction.TransactionType type) {
        return transactionRepository.findLatestTransactionByUserIdAndType(userId, type);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getUserTransactionsBetweenDates(Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getMonthlyRevenue(int year, int month) {
        Double revenue = transactionRepository.getRevenueByMonth(year, month);
        return revenue != null ? revenue : 0.0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Transaction> getPaidTransactionsByMonth(int year, int month) {
        return transactionRepository.findPaidTransactionsByMonth(year, month);
    }

    @Override
    public void deleteTransaction(Long id) {
        log.info("Soft deleting transaction with ID: {}", id);
        // Note: Implement soft delete logic if needed
        // For now, we don't actually delete transactions for audit purposes
        log.warn("Transaction deletion is not implemented for audit purposes");
    }

    @Override
    public void restoreTransaction(Long id) {
        log.info("Restoring transaction with ID: {}", id);
        // Note: Implement restore logic if soft delete is implemented
        log.warn("Transaction restoration is not implemented");
    }
}
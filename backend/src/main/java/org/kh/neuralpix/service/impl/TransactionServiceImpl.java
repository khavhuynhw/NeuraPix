package org.kh.neuralpix.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.repository.TransactionRepository;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;

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
                .currency(PayOSConstants.DEFAULT_CURRENCY)
                .status(Transaction.TransactionStatus.PENDING)
                .type(type)
                .paymentProvider(PayOSConstants.DEFAULT_PAYMENT_PROVIDER)
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
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Transaction markTransactionAsPaid(Long orderCode, String paymentMethod) {
        log.info("Marking transaction as paid - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        
        // Check if transaction is already paid to prevent double processing
        if (transaction.isPaid()) {
            log.warn("Transaction {} is already marked as paid, skipping update", orderCode);
            return transaction;
        }
        
        // Check if transaction is in a valid state for payment
        if (transaction.getStatus() != Transaction.TransactionStatus.PENDING) {
            log.error("Cannot mark transaction as paid. Current status: {}", transaction.getStatus());
            throw new IllegalStateException("Transaction is not in pending status: " + transaction.getStatus());
        }
        
        transaction.markAsPaid();
        transaction.setPaymentMethod(paymentMethod);

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Successfully marked transaction as paid - OrderCode: {}", orderCode);
        return updatedTransaction;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Transaction markTransactionAsCancelled(Long orderCode) {
        log.info("Marking transaction as cancelled - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        
        // Check if transaction is already in a final state
        if (transaction.isPaid() || transaction.isCancelled() || transaction.isFailed()) {
            log.warn("Transaction {} is already in final state: {}, skipping cancellation", 
                orderCode, transaction.getStatus());
            return transaction;
        }
        
        transaction.markAsCancelled("Payment cancelled");

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Successfully marked transaction as cancelled - OrderCode: {}", orderCode);
        return updatedTransaction;
    }

    @Override
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Transaction markTransactionAsFailed(Long orderCode) {
        log.info("Marking transaction as failed - OrderCode: {}", orderCode);
        
        Optional<Transaction> optionalTransaction = transactionRepository.findByOrderCode(orderCode);
        if (optionalTransaction.isEmpty()) {
            log.error("Transaction not found with order code: {}", orderCode);
            throw new RuntimeException("Transaction not found with order code: " + orderCode);
        }

        Transaction transaction = optionalTransaction.get();
        
        // Check if transaction is already in a final state
        if (transaction.isPaid() || transaction.isCancelled() || transaction.isFailed()) {
            log.warn("Transaction {} is already in final state: {}, skipping failure marking", 
                orderCode, transaction.getStatus());
            return transaction;
        }
        
        transaction.markAsFailed("Payment failed");

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Successfully marked transaction as failed - OrderCode: {}", orderCode);
        return updatedTransaction;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByOrderCode(Long orderCode) {
        return transactionRepository.existsByOrderCode(orderCode);
    }

    @Override
    @Transactional
    public void cancelExpiredPendingTransactions(int expiredHours) {
        log.info("Cancelling expired pending transactions older than {} hours", expiredHours);
        
        LocalDateTime expiredTime = LocalDateTime.now().minusHours(expiredHours);
        List<Transaction> expiredTransactions = transactionRepository.findExpiredPendingTransactions(expiredTime);
        
        int cancelledCount = 0;
        for (Transaction transaction : expiredTransactions) {
            try {
                // Check if transaction is still pending before cancelling
                if (transaction.getStatus() == Transaction.TransactionStatus.PENDING) {
                    transaction.markAsCancelled("Expired - automatically cancelled after " + expiredHours + " hours");
                    transactionRepository.save(transaction);
                    log.info("Cancelled expired transaction with order code: {}", transaction.getOrderCode());
                    cancelledCount++;
                } else {
                    log.debug("Skipping transaction {} - no longer pending (status: {})", 
                        transaction.getOrderCode(), transaction.getStatus());
                }
            } catch (Exception e) {
                log.error("Error cancelling expired transaction with order code: {}", 
                    transaction.getOrderCode(), e);
            }
        }
        
        log.info("Cancelled {} expired transactions out of {} found", cancelledCount, expiredTransactions.size());
    }
    
    /**
     * Scheduled task to automatically cancel expired pending transactions
     * Runs every hour and cancels transactions older than 24 hours
     */
    @Scheduled(cron = "0 0 * * * *") // Run every hour at minute 0
    @Transactional
    public void scheduledCancelExpiredTransactions() {
        try {
            log.info("Running scheduled cleanup of expired transactions");
            cancelExpiredPendingTransactions(24); // Cancel transactions older than 24 hours
        } catch (Exception e) {
            log.error("Error in scheduled transaction cleanup", e);
        }
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
package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.dto.TransactionDto;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v2/transactions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Lấy transaction theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransactionById(@PathVariable Long id) {
        try {
            log.info("Getting transaction by ID: {}", id);
            
            Optional<Transaction> transaction = transactionService.findById(id);
            
            if (transaction.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Transaction not found");
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", TransactionDto.fromEntity(transaction.get()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting transaction by ID: {}", id, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get transaction: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Lấy transaction theo order code
     */
    @GetMapping("/order/{orderCode}")
    public ResponseEntity<Map<String, Object>> getTransactionByOrderCode(@PathVariable Long orderCode) {
        try {
            log.info("Getting transaction by order code: {}", orderCode);
            
            Optional<Transaction> transaction = transactionService.findByOrderCode(orderCode);
            
            if (transaction.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Transaction not found");
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", TransactionDto.fromEntity(transaction.get()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting transaction by order code: {}", orderCode, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get transaction: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Lấy tất cả transactions của user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserTransactions(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Getting transactions for user ID: {} with page: {}, size: {}", userId, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Transaction> transactionPage = transactionService.getTransactionsByUserId(userId, pageable);
            
            List<TransactionDto> transactionDtos = transactionPage.getContent()
                    .stream()
                    .map(TransactionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", transactionDtos);
            response.put("pagination", Map.of(
                "currentPage", transactionPage.getNumber(),
                "totalPages", transactionPage.getTotalPages(),
                "totalElements", transactionPage.getTotalElements(),
                "pageSize", transactionPage.getSize(),
                "hasNext", transactionPage.hasNext(),
                "hasPrevious", transactionPage.hasPrevious()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting user transactions for user ID: {}", userId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get user transactions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Lấy transactions theo subscription
     */
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<Map<String, Object>> getSubscriptionTransactions(@PathVariable Long subscriptionId) {
        try {
            log.info("Getting transactions for subscription ID: {}", subscriptionId);
            
            List<Transaction> transactions = transactionService.getTransactionsBySubscriptionId(subscriptionId);
            
            List<TransactionDto> transactionDtos = transactions.stream()
                    .map(TransactionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", transactionDtos);
            response.put("total", transactionDtos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting subscription transactions for subscription ID: {}", subscriptionId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get subscription transactions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Lấy transactions theo status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getTransactionsByStatus(@PathVariable String status) {
        try {
            log.info("Getting transactions by status: {}", status);
            
            Transaction.TransactionStatus transactionStatus = Transaction.TransactionStatus.valueOf(status.toUpperCase());
            List<Transaction> transactions = transactionService.getTransactionsByStatus(transactionStatus);
            
            List<TransactionDto> transactionDtos = transactions.stream()
                    .map(TransactionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", transactionDtos);
            response.put("total", transactionDtos.size());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid transaction status: {}", status);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Invalid transaction status: " + status);
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Error getting transactions by status: {}", status, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get transactions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Thống kê transactions
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTransactionStats() {
        try {
            log.info("Getting transaction statistics");
            
            Map<String, Object> stats = new HashMap<>();
            
            // Đếm transactions theo status
            for (Transaction.TransactionStatus status : Transaction.TransactionStatus.values()) {
                long count = transactionService.countTransactionsByStatus(status);
                stats.put(status.name().toLowerCase() + "Count", count);
            }
            
            // Tính tổng doanh thu
            Double totalRevenue = transactionService.getTotalRevenueByStatus(Transaction.TransactionStatus.PAID);
            stats.put("totalRevenue", totalRevenue);
            
            // Doanh thu tháng này
            LocalDateTime now = LocalDateTime.now();
            Double monthlyRevenue = transactionService.getMonthlyRevenue(now.getYear(), now.getMonthValue());
            stats.put("monthlyRevenue", monthlyRevenue);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting transaction statistics", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get transaction statistics: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Tìm kiếm transactions trong khoảng thời gian
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchTransactions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        try {
            log.info("Searching transactions with filters - userId: {}, startDate: {}, endDate: {}, status: {}, type: {}", 
                    userId, startDate, endDate, status, type);
            
            // Parse dates
            LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusMonths(1);
            LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now();
            
            List<Transaction> transactions;
            
            if (userId != null) {
                transactions = transactionService.getUserTransactionsBetweenDates(userId, start, end);
            } else {
                transactions = transactionService.getTransactionsBetweenDates(start, end);
            }
            
            // Filter by status if provided
            if (status != null) {
                Transaction.TransactionStatus transactionStatus = Transaction.TransactionStatus.valueOf(status.toUpperCase());
                transactions = transactions.stream()
                        .filter(t -> t.getStatus() == transactionStatus)
                        .collect(Collectors.toList());
            }
            
            // Filter by type if provided
            if (type != null) {
                Transaction.TransactionType transactionType = Transaction.TransactionType.valueOf(type.toUpperCase());
                transactions = transactions.stream()
                        .filter(t -> t.getType() == transactionType)
                        .collect(Collectors.toList());
            }
            
            List<TransactionDto> transactionDtos = transactions.stream()
                    .map(TransactionDto::fromEntity)
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", transactionDtos);
            response.put("total", transactionDtos.size());
            response.put("filters", Map.of(
                "userId", userId,
                "startDate", start,
                "endDate", end,
                "status", status,
                "type", type
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error searching transactions", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to search transactions: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
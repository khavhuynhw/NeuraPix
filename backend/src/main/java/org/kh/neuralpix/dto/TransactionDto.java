package org.kh.neuralpix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {

    private Long id;
    private Long orderCode;
    private Long userId;
    private Long subscriptionId;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String type;
    private String paymentProvider;
    private String description;
    private String buyerEmail;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested DTOs for related entities (optional)
    private UserDto user;
    private SubscriptionDto subscription;

    /**
     * Convert Transaction entity to DTO
     */
    public static TransactionDto fromEntity(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        return TransactionDto.builder()
                .id(transaction.getId())
                .orderCode(transaction.getOrderCode())
                .userId(transaction.getUserId())
                .subscriptionId(transaction.getSubscriptionId())
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus() != null ? transaction.getStatus().name() : null)
                .type(transaction.getType() != null ? transaction.getType().name() : null)
                .paymentProvider(transaction.getPaymentProvider())
                .description(transaction.getDescription())
                .buyerEmail(transaction.getBuyerEmail())
                .paymentMethod(transaction.getPaymentMethod())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    /**
     * Convert Transaction entity to DTO with related entities
     */
    public static TransactionDto fromEntityWithRelations(Transaction transaction) {
        TransactionDto dto = fromEntity(transaction);
        
        if (dto != null && transaction != null) {
            // Add user info if available
            if (transaction.getUser() != null) {
                dto.setUser(UserDto.fromEntity(transaction.getUser()));
            }
            
            // Add subscription info if available
            if (transaction.getSubscription() != null) {
                dto.setSubscription(SubscriptionDto.fromEntity(transaction.getSubscription()));
            }
        }
        
        return dto;
    }

    /**
     * Convert DTO to Transaction entity (for updates)
     */
    public Transaction toEntity() {
        return Transaction.builder()
                .id(this.id)
                .orderCode(this.orderCode)
                .userId(this.userId)
                .subscriptionId(this.subscriptionId)
                .amount(this.amount)
                .currency(this.currency)
                .status(this.status != null ? Transaction.TransactionStatus.valueOf(this.status) : null)
                .type(this.type != null ? Transaction.TransactionType.valueOf(this.type) : null)
                .paymentProvider(this.paymentProvider)
                .description(this.description)
                .buyerEmail(this.buyerEmail)
                .paymentMethod(this.paymentMethod)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }

    // Helper methods for status checking
    public boolean isPaid() {
        return "PAID".equals(this.status);
    }

    public boolean isPending() {
        return "PENDING".equals(this.status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equals(this.status);
    }

    public boolean isFailed() {
        return "FAILED".equals(this.status);
    }

    // Helper methods for type checking
    public boolean isSubscriptionPayment() {
        return "SUBSCRIPTION_PAYMENT".equals(this.type);
    }

    public boolean isSubscriptionRenewal() {
        return "SUBSCRIPTION_RENEWAL".equals(this.type);
    }

    public boolean isOneTimePayment() {
        return "ONE_TIME_PAYMENT".equals(this.type);
    }
}
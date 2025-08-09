package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true)
    @NotNull(message = "Order code is required")
    private Long orderCode;

    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User ID is required")
    private Long userId;

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", message = "Amount cannot be negative")
    private BigDecimal amount;

    @Column(name = "currency", length = 3, nullable = false)
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Column(name = "payment_provider", nullable = false)
    private String paymentProvider = "PAYOS";

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "buyer_email", length = 100)
    private String buyerEmail;

    @Column(name = "payment_method")
    private String paymentMethod;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", insertable = false, updatable = false)
    private Subscription subscription;

    public enum TransactionStatus {
        PENDING,        // Giao dịch được tạo, chờ thanh toán
        PAID,           // Thanh toán thành công
        CANCELLED,      // Giao dịch bị hủy
        FAILED,         // Thanh toán thất bại
        EXPIRED,        // Giao dịch hết hạn
        REFUNDED,       // Giao dịch được hoàn tiền
        PROCESSING      // Đang xử lý
    }

    public enum TransactionType {
        SUBSCRIPTION_PAYMENT,    // Thanh toán subscription mới
        SUBSCRIPTION_RENEWAL,    // Gia hạn subscription
        SUBSCRIPTION_UPGRADE,    // Nâng cấp subscription
        SUBSCRIPTION_DOWNGRADE,  // Hạ cấp subscription
        ONE_TIME_PAYMENT,        // Thanh toán một lần
        REFUND                   // Hoàn tiền
    }

    // Helper methods
    public boolean isPaid() {
        return this.status == TransactionStatus.PAID;
    }

    public boolean isPending() {
        return this.status == TransactionStatus.PENDING;
    }

    public boolean isCancelled() {
        return this.status == TransactionStatus.CANCELLED;
    }

    public boolean isFailed() {
        return this.status == TransactionStatus.FAILED;
    }

    public void markAsPaid() {
        this.status = TransactionStatus.PAID;
    }

    public void markAsCancelled(String reason) {
        this.status = TransactionStatus.CANCELLED;
    }

    public void markAsFailed(String reason) {
        this.status = TransactionStatus.FAILED;
    }
}

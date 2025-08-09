package org.kh.neuralpix.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.Subscription;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionDto {
    private Long id;
    private Long userId;
    private String tier;
    private String status; // active, cancelled, expired, past_due
    private String billingCycle;
    private BigDecimal price;
    private String currency;
    private String paymentProvider;
    private String externalSubscriptionId;
    private Boolean autoRenew;
    private String cancellationReason;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextBillingDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelledAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private SubscriptionPlanDto plan;

//    // Payment history
//    private List<PaymentHistoryDTO> paymentHistory;

    /**
     * Convert Subscription entity to DTO
     */
    public static SubscriptionDto fromEntity(Subscription subscription) {
        if (subscription == null) {
            return null;
        }

        return SubscriptionDto.builder()
                .id(subscription.getId())
                .userId(subscription.getUserId())
                .tier(subscription.getTier() != null ? subscription.getTier().name() : null)
                .status(subscription.getStatus() != null ? subscription.getStatus().name() : null)
                .billingCycle(subscription.getBillingCycle() != null ? subscription.getBillingCycle().name() : null)
                .price(subscription.getPrice())
                .currency(subscription.getCurrency())
                .paymentProvider(subscription.getPaymentProvider())
                .externalSubscriptionId(subscription.getExternalSubscriptionId())
                .autoRenew(subscription.getAutoRenew())
                .cancellationReason(subscription.getCancellationReason())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .nextBillingDate(subscription.getNextBillingDate())
                .cancelledAt(subscription.getCancelledAt())
                .createdAt(subscription.getCreatedAt())
                .build();
    }
}

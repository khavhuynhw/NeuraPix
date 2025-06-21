package org.kh.neuralpix.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCreateRequestDto {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Subscription tier is required")
    private String tier;

    @NotBlank(message = "Billing cycle is required")
    private String billingCycle; // monthly, yearly

    @NotBlank(message = "Payment provider is required")
    private String paymentProvider; // stripe, paypal

    private String currency = "USD";
    private String paymentMethodId; // For Stripe
    private String paypalOrderId; // For PayPal
    private Boolean autoRenew = true;
}

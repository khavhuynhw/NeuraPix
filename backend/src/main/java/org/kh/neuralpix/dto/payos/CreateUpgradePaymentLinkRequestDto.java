package org.kh.neuralpix.dto.payos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.model.enums.SubscriptionTier;

@Data
public class CreateUpgradePaymentLinkRequestDto {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Subscription ID is required")
    private Long subscriptionId;
    
    @NotNull(message = "Current tier is required")
    private SubscriptionTier currentTier;
    
    @NotNull(message = "New tier is required")
    private SubscriptionTier newTier;
    
    @Min(value = PayOSConstants.MIN_AMOUNT, message = "Upgrade amount must be at least " + PayOSConstants.MIN_AMOUNT)
    private int upgradeAmount;
    
    private String description;
    
    private String returnUrl;
    
    private String cancelUrl;
    
    @Email(message = "Invalid email format")
    private String buyerEmail;
    
    private String buyerName;
    
    private String buyerPhone;
    
    private String reason;
    
    private Boolean upgradeImmediately = true;
}
package org.kh.neuralpix.dto.payos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.kh.neuralpix.constants.PayOSConstants;

@Data
public class CreatePaymentLinkRequestDto {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Product name is required")
    private String productName;
    
    private String description;
    private String returnUrl;
    
    @Min(value = PayOSConstants.MIN_AMOUNT, message = "Amount must be at least " + PayOSConstants.MIN_AMOUNT)
    private int price;
    
    private String cancelUrl;
    
    @Email(message = "Invalid email format")
    private String buyerEmail;
    
    private Long subscriptionId;
}
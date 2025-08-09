package org.kh.neuralpix.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CreatePaymentLinkRequestBody {
    private Long userId;
    private String productName;
    private String description;
    private String returnUrl;
    private int price;
    private String cancelUrl;
    private String buyerEmail;
    private Long subscriptionId; // For linking to subscriptions
}

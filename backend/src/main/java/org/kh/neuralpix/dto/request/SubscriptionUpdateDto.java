package org.kh.neuralpix.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionUpdateDto {
    private String tier;
    private String billingCycle;
    private Boolean autoRenew;
}

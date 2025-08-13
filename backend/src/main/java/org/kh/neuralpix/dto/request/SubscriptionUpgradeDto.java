package org.kh.neuralpix.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.enums.SubscriptionTier;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionUpgradeDto {
    private SubscriptionTier newTier;
    private String reason;
    private Boolean upgradeImmediately = true;
    private String paymentMethod;
    private Long paymentOrderCode;
}
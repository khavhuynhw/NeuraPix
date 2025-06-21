package org.kh.neuralpix.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCancelDto {
    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    private Boolean cancelImmediately = false; // If false, cancel at end of billing period
}

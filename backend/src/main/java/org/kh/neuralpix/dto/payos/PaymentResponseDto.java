package org.kh.neuralpix.dto.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    private boolean success;
    private String message;
    private String paymentLinkId;
    private Long orderCode;
    private String status;
    private Integer amount;
    private String description;
} 
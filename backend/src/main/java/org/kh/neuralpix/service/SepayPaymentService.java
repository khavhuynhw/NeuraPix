package org.kh.neuralpix.service;

import java.math.BigDecimal;
import java.util.Map;

public interface SepayPaymentService {
    String createPaymentUrl(String orderId, BigDecimal amount, String customerEmail);
    String generateSecureHash(Map<String, String> params);

}

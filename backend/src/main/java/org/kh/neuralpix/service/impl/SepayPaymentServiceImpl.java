package org.kh.neuralpix.service.impl;

import lombok.Value;
import org.kh.neuralpix.service.SepayPaymentService;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
public class SepayPaymentServiceImpl implements SepayPaymentService {

    @Value("${sepay.merchantId}")
    private String merchantId;

    @Value("${sepay.apiKey}")
    private String apiKey;

    @Value("${sepay.secureHashKey}")
    private String secureHashKey;

    @Value("${sepay.endpoint}")
    private String endpoint;

    @Value("${sepay.returnUrl}")
    private String returnUrl;

    @Value("${sepay.callbackUrl}")
    private String callbackUrl;

    public String createPaymentUrl(String orderId, BigDecimal amount, String customerEmail) {
        Map<String, String> params = new TreeMap<>();
        params.put("merchant_id", merchantId);
        params.put("order_id", orderId);
        params.put("amount", amount.toPlainString());
        params.put("email", customerEmail);
        params.put("return_url", returnUrl);
        params.put("callback_url", callbackUrl);

        // Tạo secure hash
        String hash = generateSecureHash(params);
        params.put("signature", hash);

        // Gửi request tới SEPAY
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(endpoint);
        for (Map.Entry<String, String> entry : params.entrySet()) {
            builder.queryParam(entry.getKey(), entry.getValue());
        }

        return builder.toUriString(); // URL chuyển hướng người dùng tới trang thanh toán
    }

    private String generateSecureHash(Map<String, String> params) {
        String rawData = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));
        rawData += secureHashKey;
        return DigestUtils.sha256Hex(rawData);
    }
}


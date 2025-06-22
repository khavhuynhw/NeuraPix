package org.kh.neuralpix.service;

import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.math.BigDecimal;

public interface PayOSPaymentService {
    CheckoutResponseData createPaymentLink(Long orderCode, BigDecimal amount, String description, String buyerEmail, String buyerName);
    PaymentLinkData getPaymentLinkInfo(Long orderCode);
    PaymentLinkData cancelPaymentLink(Long orderCode, String reason);
    WebhookData verifyWebhookData(Webhook webhookData);
    void confirmWebhook(String webhookUrl);
} 
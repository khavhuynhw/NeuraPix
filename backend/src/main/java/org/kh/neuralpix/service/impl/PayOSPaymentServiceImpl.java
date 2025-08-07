package org.kh.neuralpix.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.model.Transaction;
import org.kh.neuralpix.service.TransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.kh.neuralpix.service.PayOSPaymentService;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;

import jakarta.annotation.PostConstruct;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;
import java.math.BigDecimal;
import java.util.Collections;

@Service
@Slf4j
@RequiredArgsConstructor
public class PayOSPaymentServiceImpl implements PayOSPaymentService {

    private final TransactionService transactionService;

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    private PayOS payOS;

    @PostConstruct
    public void init() {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
        log.info("PayOS service initialized with client ID: {}", clientId);
    }

    @Override
    public CheckoutResponseData createPaymentLink(Long orderCode, BigDecimal amount, String description, String buyerEmail) {
        return createPaymentLinkWithTransaction(orderCode, null, null, amount, Transaction.TransactionType.ONE_TIME_PAYMENT, description, buyerEmail);
    }

    /**
     * Tạo payment link và lưu transaction
     */
    public CheckoutResponseData createPaymentLinkWithTransaction(Long orderCode, Long userId, Long subscriptionId, 
                                                               BigDecimal amount, Transaction.TransactionType type, 
                                                               String description, String buyerEmail) {
        try {
            log.info("Creating payment link for order: {} with amount: {}", orderCode, amount);
            
            // Kiểm tra orderCode đã tồn tại chưa
            if (transactionService.existsByOrderCode(orderCode)) {
                throw new RuntimeException("Order code already exists: " + orderCode);
            }
            
            PaymentData.PaymentDataBuilder paymentDataBuilder = PaymentData.builder()
                    .orderCode(orderCode)
                    .amount(amount.intValue())
                    .description(description)
                    .returnUrl(returnUrl)
                    .cancelUrl(cancelUrl);

            // Add buyer information if provided
            if (buyerEmail != null && !buyerEmail.isEmpty()) {
                paymentDataBuilder.buyerEmail(buyerEmail);
            }


            // Add default item
            ItemData item = ItemData.builder()
                    .name(description)
                    .quantity(1)
                    .price(amount.intValue())
                    .build();
            
            paymentDataBuilder.items(Collections.singletonList(item));

            PaymentData paymentData = paymentDataBuilder.build();
            
            CheckoutResponseData response = payOS.createPaymentLink(paymentData);

            if (userId != null) {
                transactionService.createPayOSTransaction(
                    orderCode, 
                    userId, 
                    subscriptionId, 
                    amount, 
                    type, 
                    description, 
                    buyerEmail
                );
                log.info("Transaction saved for order: {}", orderCode);
            }
            
            log.info("Payment link created successfully for order: {}", orderCode);
            return response;
            
        } catch (Exception e) {
            log.error("Error creating payment link for order: {}", orderCode, e);
            throw new RuntimeException("Failed to create payment link: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentLinkData getPaymentLinkInfo(Long orderCode) {
        try {
            log.info("Getting payment link info for order: {}", orderCode);
            PaymentLinkData paymentData = payOS.getPaymentLinkInformation(orderCode);
            log.info("Retrieved payment info for order: {}", orderCode);
            return paymentData;
        } catch (Exception e) {
            log.error("Error getting payment link info for order: {}", orderCode, e);
            throw new RuntimeException("Failed to get payment link info: " + e.getMessage(), e);
        }
    }

    @Override
    public PaymentLinkData cancelPaymentLink(Long orderCode, String reason) {
        try {
            log.info("Cancelling payment link for order: {} with reason: {}", orderCode, reason);
            
            PaymentLinkData paymentData = payOS.cancelPaymentLink(orderCode, reason);
            
            // Cập nhật transaction status
            try {
                transactionService.markTransactionAsCancelled(orderCode);
                log.info("Transaction marked as cancelled for order: {}", orderCode);
            } catch (Exception e) {
                log.warn("Failed to update transaction status for order: {}", orderCode, e);
                // Không throw exception vì PayOS đã cancel thành công
            }
            
            log.info("Payment link cancelled for order: {}", orderCode);
            return paymentData;
        } catch (Exception e) {
            log.error("Error cancelling payment link for order: {}", orderCode, e);
            throw new RuntimeException("Failed to cancel payment link: " + e.getMessage(), e);
        }
    }

    @Override
    public WebhookData verifyWebhookData(Webhook webhookData) {
        try {
            log.info("Verifying webhook data");
            WebhookData webhookData1 = payOS.verifyPaymentWebhookData(webhookData);
            log.info("Webhook data verified successfully");
            return webhookData1;
        } catch (Exception e) {
            log.error("Error verifying webhook data", e);
            throw new RuntimeException("Failed to verify webhook data: " + e.getMessage(), e);
        }
    }

    @Override
    public void confirmWebhook(String webhookUrl) {
        try {
            log.info("Confirming webhook URL: {}", webhookUrl);
            payOS.confirmWebhook(webhookUrl);
            log.info("Webhook confirmed successfully");
        } catch (Exception e) {
            log.error("Error confirming webhook URL: {}", webhookUrl, e);
            throw new RuntimeException("Failed to confirm webhook: " + e.getMessage(), e);
        }
    }
} 
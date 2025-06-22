package org.kh.neuralpix.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.dto.payos.CreatePaymentLinkRequestBody;
import org.kh.neuralpix.service.PayOSPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.PaymentLinkData;
import vn.payos.type.Webhook;
import vn.payos.type.WebhookData;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/payments/payos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class PayOSPaymentController {

    private final PayOSPaymentService payOSPaymentService;

    @PostMapping("/create-payment-link")
    public ResponseEntity<Map<String, Object>> createPaymentLink(@RequestBody CreatePaymentLinkRequestBody request) {
        try {
            log.info("Creating PayOS payment link for: {}", request.getProductName());
            
            // Generate order code (you might want to use a proper order management system)
            Long orderCode = System.currentTimeMillis() / 1000; // Simple timestamp-based order code
            
            CheckoutResponseData response = payOSPaymentService.createPaymentLink(
                    orderCode,
                    BigDecimal.valueOf(request.getPrice()),
                    request.getDescription(),
                    null, // buyerEmail - can be added to request if needed
                    request.getBuyerName()
            );

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            result.put("orderCode", orderCode);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating PayOS payment link", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create payment link: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/payment-info/{orderCode}")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(@PathVariable Long orderCode) {
        try {
            log.info("Getting PayOS payment info for order: {}", orderCode);
            
            PaymentLinkData paymentInfo = payOSPaymentService.getPaymentLinkInfo(orderCode);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", paymentInfo);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error getting PayOS payment info for order: {}", orderCode, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to get payment info: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/cancel-payment/{orderCode}")
    public ResponseEntity<Map<String, Object>> cancelPayment(@PathVariable Long orderCode, 
                                                           @RequestParam(required = false) String reason) {
        try {
            log.info("Cancelling PayOS payment for order: {}", orderCode);
            
            String cancellationReason = reason != null ? reason : "Payment cancelled by user";
            PaymentLinkData paymentInfo = payOSPaymentService.cancelPaymentLink(orderCode, cancellationReason);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", paymentInfo);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error cancelling PayOS payment for order: {}", orderCode, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to cancel payment: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> handleWebhook(@RequestBody Webhook webhookData) {
        try {
            log.info("Received PayOS webhook");
            
            WebhookData verifiedData = payOSPaymentService.verifyWebhookData(webhookData);
            
            // Process the verified webhook data
            // You can add your business logic here, such as:
            // - Update subscription status
            // - Record payment in database
            // - Send confirmation emails
            // - Update user permissions
            
            log.info("PayOS webhook processed successfully for order: {}", verifiedData.getOrderCode());
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook processed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing PayOS webhook", e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to process webhook: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PostMapping("/confirm-webhook")
    public ResponseEntity<Map<String, String>> confirmWebhook(@RequestParam String webhookUrl) {
        try {
            log.info("Confirming PayOS webhook URL: {}", webhookUrl);
            
            payOSPaymentService.confirmWebhook(webhookUrl);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook URL confirmed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error confirming PayOS webhook URL: {}", webhookUrl, e);
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Failed to confirm webhook URL: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
} 
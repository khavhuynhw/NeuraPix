package org.kh.neuralpix.utils;

import lombok.extern.slf4j.Slf4j;
import org.kh.neuralpix.constants.PayOSConstants;
import vn.payos.type.PaymentLinkData;

/**
 * Utility class for payment status determination and processing
 */
@Slf4j
public class PaymentStatusUtil {

    private PaymentStatusUtil() {
        // Utility class - prevent instantiation
    }

    /**
     * Determine actual payment status from PayOS response and URL parameters
     */
    public static String determineActualPaymentStatus(PaymentLinkData paymentInfo, String urlStatus) {
        // Priority 1: PayOS payment info status (most reliable)
        if (paymentInfo != null && paymentInfo.getStatus() != null) {
            String payOSStatus = paymentInfo.getStatus().toUpperCase();
            log.info("Using PayOS status: {}", payOSStatus);
            
            if (PayOSConstants.STATUS_PAID.equals(payOSStatus)) {
                return "paid";
            } else if (PayOSConstants.STATUS_CANCELLED.equals(payOSStatus)) {
                return "cancelled";
            } else if (PayOSConstants.STATUS_FAILED.equals(payOSStatus)) {
                return "failed";
            }
        }
        
        // Priority 2: URL status parameter
        if (urlStatus != null && !urlStatus.trim().isEmpty()) {
            String status = urlStatus.toLowerCase().trim();
            log.info("Using URL status parameter: {}", status);
            
            if (status.contains("success") || status.contains("paid") || status.equals("00")) {
                return "paid";
            } else if (status.contains("cancel") || status.equals("01")) {
                return "cancelled";
            } else if (status.contains("fail") || status.contains("error") || status.equals("02")) {
                return "failed";
            }
        }
        
        log.warn("Could not determine payment status from PayOS info or URL parameters, defaulting to failed");
        return "failed";
    }

    /**
     * Check if payment status indicates success
     */
    public static boolean isSuccessStatus(String paymentStatus) {
        return "paid".equalsIgnoreCase(paymentStatus) || "success".equalsIgnoreCase(paymentStatus);
    }

    /**
     * Check if payment status indicates cancellation
     */
    public static boolean isCancelledStatus(String paymentStatus) {
        return "cancelled".equalsIgnoreCase(paymentStatus) || "canceled".equalsIgnoreCase(paymentStatus);
    }

    /**
     * Check if payment status indicates failure
     */
    public static boolean isFailedStatus(String paymentStatus) {
        return "failed".equalsIgnoreCase(paymentStatus) || "error".equalsIgnoreCase(paymentStatus);
    }

    /**
     * Convert PayOS status code to readable status
     */
    public static String convertPayOSStatusCode(String statusCode) {
        if (statusCode == null) {
            return "unknown";
        }
        
        switch (statusCode) {
            case PayOSConstants.PAYMENT_SUCCESS:
                return "paid";
            case PayOSConstants.PAYMENT_CANCELLED:
                return "cancelled";
            case PayOSConstants.PAYMENT_FAILED:
                return "failed";
            case PayOSConstants.PAYMENT_PENDING:
                return "pending";
            default:
                return "unknown";
        }
    }

    /**
     * Get user-friendly status message
     */
    public static String getStatusMessage(String paymentStatus) {
        switch (paymentStatus.toLowerCase()) {
            case "paid":
            case "success":
                return "Payment completed successfully";
            case "cancelled":
            case "canceled":
                return "Payment was cancelled";
            case "failed":
            case "error":
                return "Payment failed";
            case "pending":
                return "Payment is being processed";
            default:
                return "Payment status unknown";
        }
    }
}
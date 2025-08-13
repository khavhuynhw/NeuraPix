package org.kh.neuralpix.utils;

import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for creating payment response objects
 */
public class PaymentResponseUtil {

    private PaymentResponseUtil() {
        // Utility class - prevent instantiation
    }

    /**
     * Create redirect HTML response
     */
    public static ResponseEntity<String> createRedirectResponse(String redirectUrl, String title, String message) {
        String html = "<!DOCTYPE html>\\n" +
                "<html>\\n" +
                "<head>\\n" +
                "    <meta charset='UTF-8'>\\n" +
                "    <title>" + title + "</title>\\n" +
                "    <script>\\n" +
                "        window.location.href = '" + redirectUrl + "';\\n" +
                "    </script>\\n" +
                "</head>\\n" +
                "<body>\\n" +
                "    <p>" + message + "</p>\\n" +
                "    <p>If you are not redirected automatically, <a href='" + redirectUrl + "'>click here</a>.</p>\\n" +
                "</body>\\n" +
                "</html>";
        
        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(html);
    }

    /**
     * Create error redirect response with default message
     */
    public static ResponseEntity<String> createErrorRedirectResponse(String homeUrl) {
        return createErrorRedirectResponse("Payment processing error", homeUrl);
    }
    
    /**
     * Create error redirect response with custom message
     */
    public static ResponseEntity<String> createErrorRedirectResponse(String errorMessage, String homeUrl) {
        String errorHtml = "<!DOCTYPE html>\\n" +
                "<html>\\n" +
                "<head>\\n" +
                "    <meta charset='UTF-8'>\\n" +
                "    <title>Payment Error</title>\\n" +
                "</head>\\n" +
                "<body>\\n" +
                "    <h1>Payment Processing Error</h1>\\n" +
                "    <p>" + errorMessage + "</p>\\n" +
                "    <p>Please contact support if this issue persists.</p>\\n" +
                "    <p><a href='" + homeUrl + "'>Return to Home</a></p>\\n" +
                "</body>\\n" +
                "</html>";
        
        return ResponseEntity.internalServerError()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(errorHtml);
    }

    /**
     * Create JSON error response
     */
    public static ResponseEntity<Map<String, Object>> createErrorResponse(String message, int statusCode) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        
        if (statusCode == 400) {
            return ResponseEntity.badRequest().body(error);
        } else {
            return ResponseEntity.internalServerError().body(error);
        }
    }

    /**
     * Create webhook error response
     */
    public static ResponseEntity<Map<String, String>> createWebhookErrorResponse(String message, int statusCode) {
        Map<String, String> error = new HashMap<>();
        error.put("status", "error");
        error.put("message", message);
        return ResponseEntity.status(statusCode).body(error);
    }

    /**
     * Create success response with data
     */
    public static ResponseEntity<Map<String, Object>> createSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    /**
     * Create success response with data and additional fields
     */
    public static ResponseEntity<Map<String, Object>> createSuccessResponse(Object data, Map<String, Object> additionalFields) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        if (additionalFields != null) {
            response.putAll(additionalFields);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Create webhook success response
     */
    public static ResponseEntity<Map<String, String>> createWebhookSuccessResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Create webhook accepted response (for errors that shouldn't trigger retries)
     */
    public static ResponseEntity<Map<String, String>> createWebhookAcceptedResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "accepted");
        response.put("message", message);
        return ResponseEntity.ok(response);
    }
}
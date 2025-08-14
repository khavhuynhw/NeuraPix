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
        String html = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>%s</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #74ABE2, #5563DE);
                    color: #333;
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .card {
                    background: white;
                    padding: 30px 40px;
                    border-radius: 12px;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                    text-align: center;
                    animation: fadeIn 0.5s ease-in-out;
                }
                h1 {
                    color: #5563DE;
                    margin-bottom: 15px;
                }
                p {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                a.button {
                    display: inline-block;
                    padding: 10px 20px;
                    background: #5563DE;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: background 0.3s ease;
                }
                a.button:hover {
                    background: #3f4ab8;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
            <script>
                setTimeout(function() {
                    window.location.href = '%s';
                }, 2000);
            </script>
        </head>
        <body>
            <div class="card">
                <h1>%s</h1>
                <p>%s</p>
                <a class="button" href="%s">Go now</a>
            </div>
        </body>
        </html>
    """.formatted(title, redirectUrl, title, message, redirectUrl);

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
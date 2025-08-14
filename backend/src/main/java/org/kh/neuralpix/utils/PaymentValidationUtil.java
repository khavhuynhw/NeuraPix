package org.kh.neuralpix.utils;

import org.kh.neuralpix.constants.PayOSConstants;
import org.kh.neuralpix.dto.payos.CreatePaymentLinkRequestDto;
import org.kh.neuralpix.dto.payos.CreateUpgradePaymentLinkRequestDto;

/**
 * Utility class for payment validation logic
 */
public class PaymentValidationUtil {

    private PaymentValidationUtil() {
        // Utility class - prevent instantiation
    }

    /**
     * Validate create payment link request
     */
    public static void validateCreatePaymentRequest(CreatePaymentLinkRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Payment request cannot be null");
        }
        
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (request.getPrice() < PayOSConstants.MIN_AMOUNT) {
            throw new IllegalArgumentException("Amount must be at least " + PayOSConstants.MIN_AMOUNT + " VND");
        }
        
        if (request.getPrice() > PayOSConstants.MAX_AMOUNT) {
            throw new IllegalArgumentException("Amount cannot exceed " + PayOSConstants.MAX_AMOUNT + " VND");
        }
        
        if (request.getProductName() == null || request.getProductName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        
        if (request.getBuyerEmail() != null && !isValidEmail(request.getBuyerEmail())) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    /**
     * Validate order code
     */
    public static void validateOrderCode(Long orderCode) {
        if (orderCode == null) {
            throw new IllegalArgumentException("Order code cannot be null");
        }
        
        if (orderCode <= 0) {
            throw new IllegalArgumentException("Order code must be a positive number");
        }
    }

    /**
     * Validate webhook URL
     */
    public static void validateWebhookUrl(String webhookUrl) {
        if (webhookUrl == null || webhookUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Webhook URL cannot be empty");
        }
        
        if (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
            throw new IllegalArgumentException("Webhook URL must be a valid HTTP/HTTPS URL");
        }
    }

    /**
     * Validate amount range
     */
    public static void validateAmount(int amount) {
        if (amount < PayOSConstants.MIN_AMOUNT) {
            throw new IllegalArgumentException("Amount must be at least " + PayOSConstants.MIN_AMOUNT + " VND");
        }
        
        if (amount > PayOSConstants.MAX_AMOUNT) {
            throw new IllegalArgumentException("Amount cannot exceed " + PayOSConstants.MAX_AMOUNT + " VND");
        }
    }

    /**
     * Validate product name
     */
    public static void validateProductName(String productName) {
        if (productName == null || productName.trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        
        if (productName.length() > PayOSConstants.MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException("Product name cannot exceed " + PayOSConstants.MAX_DESCRIPTION_LENGTH + " characters");
        }
    }

    /**
     * Validate description
     */
    public static void validateDescription(String description) {
        if (description != null && description.length() > PayOSConstants.MAX_DESCRIPTION_LENGTH) {
            throw new IllegalArgumentException("Description cannot exceed " + PayOSConstants.MAX_DESCRIPTION_LENGTH + " characters");
        }
    }

    /**
     * Validate upgrade payment request
     */
    public static void validateUpgradePaymentRequest(CreateUpgradePaymentLinkRequestDto request) {
        if (request == null) {
            throw new IllegalArgumentException("Upgrade payment request cannot be null");
        }
        
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required for upgrade payment");
        }
        
        if (request.getSubscriptionId() == null) {
            throw new IllegalArgumentException("Subscription ID is required for upgrade payment");
        }
        
        if (request.getCurrentTier() == null) {
            throw new IllegalArgumentException("Current tier is required for upgrade payment");
        }
        
        if (request.getNewTier() == null) {
            throw new IllegalArgumentException("New tier is required for upgrade payment");
        }
        
        if (request.getCurrentTier().equals(request.getNewTier())) {
            throw new IllegalArgumentException("New tier must be different from current tier");
        }
        
        if (request.getUpgradeAmount() < PayOSConstants.MIN_AMOUNT) {
            throw new IllegalArgumentException("Upgrade amount must be at least " + PayOSConstants.MIN_AMOUNT + " VND");
        }
        
        if (request.getUpgradeAmount() > PayOSConstants.MAX_AMOUNT) {
            throw new IllegalArgumentException("Upgrade amount cannot exceed " + PayOSConstants.MAX_AMOUNT + " VND");
        }
        
        if (request.getBuyerEmail() != null && !isValidEmail(request.getBuyerEmail())) {
            throw new IllegalArgumentException("Invalid email format for upgrade payment");
        }
        
        // Validate tier upgrade logic (can only upgrade, not downgrade)
        validateTierUpgrade(request.getCurrentTier().name(), request.getNewTier().name());
    }
    
    /**
     * Validate that the tier change is indeed an upgrade
     */
    private static void validateTierUpgrade(String currentTier, String newTier) {
        int currentLevel = getTierLevel(currentTier);
        int newLevel = getTierLevel(newTier);
        
        if (newLevel <= currentLevel) {
            throw new IllegalArgumentException("Cannot downgrade subscription tier through upgrade payment. Use update subscription instead.");
        }
    }
    
    /**
     * Get numeric level for tier comparison
     */
    private static int getTierLevel(String tier) {
        switch (tier.toUpperCase()) {
            case "FREE": return 0;
            case "BASIC": return 1;
            case "PREMIUM": return 2;
            default: return -1;
        }
    }
}
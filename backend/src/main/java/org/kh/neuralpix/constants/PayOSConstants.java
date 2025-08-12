package org.kh.neuralpix.constants;

/**
 * PayOS Payment Status Constants
 */
public final class PayOSConstants {
    
    // PayOS Payment Status Codes
    public static final String PAYMENT_SUCCESS = "00";
    public static final String PAYMENT_CANCELLED = "01";
    public static final String PAYMENT_FAILED = "02";
    public static final String PAYMENT_PENDING = "03";
    
    // PayOS Payment Status Names
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_PENDING = "PENDING";
    
    // PayOS Payment Methods
    public static final String PAYMENT_METHOD_BANK_TRANSFER = "BANK_TRANSFER";
    public static final String PAYMENT_METHOD_CREDIT_CARD = "CREDIT_CARD";
    public static final String PAYMENT_METHOD_WALLET = "WALLET";
    
    // Default values
    public static final String DEFAULT_CURRENCY = "VND";
    public static final String DEFAULT_PAYMENT_PROVIDER = "PAYOS";
    
    // Validation constants
    public static final int MIN_AMOUNT = 1000; // Minimum 1,000 VND
    public static final int MAX_AMOUNT = 500000000; // Maximum 500,000,000 VND
    public static final int MAX_DESCRIPTION_LENGTH = 255;
    
    private PayOSConstants() {
        // Utility class - prevent instantiation
    }
}
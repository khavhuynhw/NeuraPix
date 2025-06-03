package org.kh.neuralpix.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String username, String resetLink);
} 
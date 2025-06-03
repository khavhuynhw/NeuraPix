package org.kh.neuralpix.service;

public interface EmailService {
    void sendResetPasswordEmail(String to, String resetLink);
}

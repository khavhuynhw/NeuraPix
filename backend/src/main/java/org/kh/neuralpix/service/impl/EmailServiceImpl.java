package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.service.EmailService;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendResetPasswordEmail(String to, String resetLink) {
        // TODO: Replace with real email sender like JavaMailSender
        System.out.println("Sending reset link to: " + to);
        System.out.println("Reset Link: " + resetLink);
    }
}

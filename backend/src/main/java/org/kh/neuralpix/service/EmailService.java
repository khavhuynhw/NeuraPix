package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.User;

public interface EmailService {
    void sendPasswordResetEmail(String to, String username, String resetLink);
    void sendSubscriptionConfirmation(User user, Subscription subscription);
    void sendUpgradeConfirmation(User user, Subscription subscription);
    void sendCancellationConfirmation(User user, Subscription subscription);
    void sendExpirationNotification(User user, Subscription subscription);
} 
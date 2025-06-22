package org.kh.neuralpix.service.impl;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import lombok.RequiredArgsConstructor;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.SubscriptionTier;
import org.kh.neuralpix.model.User;
import org.kh.neuralpix.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final MustacheFactory mustacheFactory;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.mustacheFactory = new DefaultMustacheFactory();
    }

    @Override
    public void sendPasswordResetEmail(String to, String username, String resetLink) {
        try {
            Reader templateReader = new InputStreamReader(new ClassPathResource("templates/email/password-reset.html").getInputStream());
            Mustache mustache = mustacheFactory.compile(templateReader, "password-reset");
            
            Map<String, Object> context = new HashMap<>();
            context.put("username", username);
            context.put("resetLink", frontendUrl + "/reset-password?token=" + resetLink);
            context.put("currentYear", Year.now().getValue());

            StringWriter writer = new StringWriter();
            mustache.execute(writer, context);
            String emailContent = writer.toString();

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Reset Your NeuralPix Password");
            helper.setText(emailContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendSubscriptionConfirmation(User user, Subscription subscription) {
        try {
            Reader templateReader = new InputStreamReader(new ClassPathResource("templates/email/subscription-confirmation.html").getInputStream());
            Mustache mustache = mustacheFactory.compile(templateReader, "subscription-confirmation");
            
            Map<String, Object> context = new HashMap<>();
            context.put("username", user.getUsername());
            context.put("email", user.getEmail());
            context.put("tierName", getTierDisplayName(subscription.getTier()));
            context.put("billingCycle", formatBillingCycle(subscription.getBillingCycle()));
            context.put("price", subscription.getPrice());
            context.put("currency", subscription.getCurrency() != null ? subscription.getCurrency() : "USD");
            context.put("paymentProvider", formatPaymentProvider(subscription.getPaymentProvider()));
            context.put("startDate", formatDate(subscription.getStartDate()));
            context.put("nextBillingDate", formatDate(subscription.getNextBillingDate()));
            context.put("dashboardUrl", frontendUrl + "/dashboard");
            context.put("currentYear", Year.now().getValue());
            
            // Add tier-specific benefits
            List<String> benefits = getTierBenefits(subscription.getTier());
            if (!benefits.isEmpty()) {
                context.put("benefits", true);
                context.put("benefitsList", benefits);
            }

            StringWriter writer = new StringWriter();
            mustache.execute(writer, context);
            String emailContent = writer.toString();

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to NeuralPix " + getTierDisplayName(subscription.getTier()) + "! 🎉");
            helper.setText(emailContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send subscription confirmation email", e);
        }
    }

    private String getTierDisplayName(SubscriptionTier tier) {
        switch (tier) {
            case FREE:
                return "Free";
            case BASIC:
                return "Basic";
            case PREMIUM:
                return "Premium";
            default:
                return tier.name();
        }
    }

    private String formatBillingCycle(Subscription.BillingCycle billingCycle) {
        switch (billingCycle) {
            case MONTHLY:
                return "Monthly";
            case YEARLY:
                return "Yearly";
            default:
                return billingCycle.name();
        }
    }

    private String formatPaymentProvider(String paymentProvider) {
        if (paymentProvider == null) return null;
        
        switch (paymentProvider.toLowerCase()) {
            case "payos":
                return "PayOS";
            case "stripe":
                return "Stripe";
            case "paypal":
                return "PayPal";
            case "sepay":
                return "SePay";
            default:
                return paymentProvider;
        }
    }

    private String formatDate(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        return dateTime.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
    }

    private List<String> getTierBenefits(SubscriptionTier tier) {
        List<String> benefits = new ArrayList<>();
        
        switch (tier) {
            case FREE:
                benefits.add("5 image generations per day");
                benefits.add("Basic image resolution (512x512)");
                benefits.add("Standard processing queue");
                benefits.add("Community support");
                break;
            case BASIC:
                benefits.add("50 image generations per day");
                benefits.add("High resolution images (1024x1024)");
                benefits.add("Priority processing");
                benefits.add("Email support");
                benefits.add("No watermarks");
                break;
            case PREMIUM:
                benefits.add("Unlimited image generations");
                benefits.add("Ultra-high resolution (2048x2048)");
                benefits.add("Fastest processing priority");
                benefits.add("24/7 premium support");
                benefits.add("Commercial license");
                benefits.add("API access");
                benefits.add("Advanced AI models");
                benefits.add("Bulk generation tools");
                break;
        }
        
        return benefits;
    }

    @Override
    public void sendCancellationConfirmation(User user, Subscription subscription) {
        try {
            Reader templateReader = new InputStreamReader(new ClassPathResource("templates/email/cancellation-confirmation.html").getInputStream());
            Mustache mustache = mustacheFactory.compile(templateReader, "cancellation-confirmation");
            
            Map<String, Object> context = new HashMap<>();
            context.put("username", user.getUsername());
            context.put("email", user.getEmail());
            context.put("tierName", getTierDisplayName(subscription.getTier()));
            context.put("cancellationDate", formatDate(subscription.getCancelledAt() != null ? subscription.getCancelledAt() : java.time.LocalDateTime.now()));
            context.put("cancellationReason", subscription.getCancellationReason());
            context.put("endDate", formatDate(subscription.getEndDate()));
            context.put("currency", subscription.getCurrency() != null ? subscription.getCurrency() : "USD");
            
            // Determine if cancelled immediately based on end date
            boolean cancelImmediately = subscription.getEndDate() != null && 
                subscription.getEndDate().isBefore(java.time.LocalDateTime.now().plusDays(1));
            context.put("cancelImmediately", cancelImmediately);
            
            // URLs
            context.put("dashboardUrl", frontendUrl + "/dashboard");
            context.put("reactivateUrl", frontendUrl + "/subscription/plans");
            context.put("feedbackUrl", frontendUrl + "/feedback?type=cancellation");
            context.put("currentYear", Year.now().getValue());
            
            // Optional refund amount (if applicable)
            // context.put("refundAmount", calculateRefundAmount(subscription));

            StringWriter writer = new StringWriter();
            mustache.execute(writer, context);
            String emailContent = writer.toString();

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Subscription Cancelled - We're Sorry to See You Go");
            helper.setText(emailContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send cancellation confirmation email", e);
        }
    }

    @Override
    public void sendExpirationNotification(User user, Subscription subscription) {
        try {
            Reader templateReader = new InputStreamReader(new ClassPathResource("templates/email/expiration-notification.html").getInputStream());
            Mustache mustache = mustacheFactory.compile(templateReader, "expiration-notification");
            
            Map<String, Object> context = new HashMap<>();
            context.put("username", user.getUsername());
            context.put("email", user.getEmail());
            context.put("tierName", getTierDisplayName(subscription.getTier()));
            context.put("expirationDate", formatDate(subscription.getEndDate()));
            context.put("billingCycle", formatBillingCycle(subscription.getBillingCycle()));
            context.put("billingCycleLower", formatBillingCycle(subscription.getBillingCycle()).toLowerCase());
            context.put("price", subscription.getPrice());
            context.put("currency", subscription.getCurrency() != null ? subscription.getCurrency() : "USD");
            
            // Check if subscription is already expired
            boolean isExpired = subscription.getEndDate() != null && 
                subscription.getEndDate().isBefore(java.time.LocalDateTime.now());
            context.put("isExpired", isExpired);
            
            // Calculate time until expiry for non-expired subscriptions
            if (!isExpired && subscription.getEndDate() != null) {
                String timeUntilExpiry = calculateTimeUntilExpiry(subscription.getEndDate());
                String urgencyClass = getUrgencyClass(subscription.getEndDate());
                context.put("timeUntilExpiry", timeUntilExpiry);
                context.put("urgencyClass", urgencyClass);
            }
            
            // Add tier-specific features that will be lost/have been lost
            List<String> tierFeatures = getTierBenefits(subscription.getTier());
            List<String> freeFeatures = getTierBenefits(SubscriptionTier.FREE);
            
            if (isExpired) {
                context.put("lostFeatures", tierFeatures);
            } else {
                context.put("featuresAtRisk", tierFeatures);
            }
            context.put("freeTierFeatures", freeFeatures);
            
            // URLs
            context.put("dashboardUrl", frontendUrl + "/dashboard");
            context.put("renewUrl", frontendUrl + "/subscription/renew?plan=" + subscription.getTier().name().toLowerCase());
            context.put("upgradeUrl", frontendUrl + "/subscription/plans");
            context.put("currentYear", Year.now().getValue());

            StringWriter writer = new StringWriter();
            mustache.execute(writer, context);
            String emailContent = writer.toString();

            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            
            String subject = isExpired ? 
                "Your NeuralPix " + getTierDisplayName(subscription.getTier()) + " Subscription Has Expired" :
                "Your NeuralPix Subscription Expires Soon - Action Required";
            
            helper.setSubject(subject);
            helper.setText(emailContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send expiration notification email", e);
        }
    }
    
    private String calculateTimeUntilExpiry(java.time.LocalDateTime endDate) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        long daysUntilExpiry = java.time.Duration.between(now, endDate).toDays();
        
        if (daysUntilExpiry < 0) {
            return "expired";
        } else if (daysUntilExpiry == 0) {
            return "today";
        } else if (daysUntilExpiry == 1) {
            return "tomorrow";
        } else if (daysUntilExpiry <= 7) {
            return "in " + daysUntilExpiry + " days";
        } else if (daysUntilExpiry <= 30) {
            long weeks = daysUntilExpiry / 7;
            return "in " + weeks + " week" + (weeks > 1 ? "s" : "");
        } else {
            long months = daysUntilExpiry / 30;
            return "in " + months + " month" + (months > 1 ? "s" : "");
        }
    }
    
    private String getUrgencyClass(java.time.LocalDateTime endDate) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        long daysUntilExpiry = java.time.Duration.between(now, endDate).toDays();
        
        if (daysUntilExpiry <= 1) {
            return "urgency-high";
        } else if (daysUntilExpiry <= 7) {
            return "urgency-medium";
        } else {
            return "";
        }
    }
} 
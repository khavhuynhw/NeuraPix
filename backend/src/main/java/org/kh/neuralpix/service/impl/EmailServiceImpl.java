package org.kh.neuralpix.service.impl;

import com.github.mustachejava.DefaultMustacheFactory;
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import lombok.RequiredArgsConstructor;
import org.kh.neuralpix.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringWriter;
import java.time.Year;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final MustacheFactory mustacheFactory;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
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
} 
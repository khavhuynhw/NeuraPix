package org.kh.neuralpix.service.impl;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.kh.neuralpix.model.Subscription;
import org.kh.neuralpix.model.User;
import org.kh.neuralpix.repository.SubscriptionRepository;
import org.kh.neuralpix.repository.UserRepository;
import org.kh.neuralpix.repository.UserSubscriptionHistoryRepository;
import org.kh.neuralpix.repository.SubscriptionPlanRepository;
import org.kh.neuralpix.service.EmailService;
import org.kh.neuralpix.service.PayOSPaymentService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import static org.mockito.Mockito.*;
import java.lang.reflect.Method;

class SubscriptionServiceImplTest {
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSubscriptionHistoryRepository historyRepository;
    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;
    @Mock
    private PayOSPaymentService payOSPaymentService;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSetupWorks() {
        assertEquals(2, 1 + 1, "Basic math should work");
    }

    @Test
    void testRenewSubscription_AutoRenewEnabled_Success() {
        // Arrange
        Long subscriptionId = 1L;
        Long userId = 2L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(true);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        User user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Mock PayOS payment always succeeds
        when(payOSPaymentService.createPaymentLink(anyLong(), any(), anyString(), anyString(), anyString()))
                .thenReturn(mock(vn.payos.type.CheckoutResponseData.class));
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        verify(subscriptionRepository, atLeastOnce()).save(any(Subscription.class));
        verify(emailService, atLeastOnce()).sendSubscriptionConfirmation(eq(user), any(Subscription.class));
        assertEquals(Subscription.SubscriptionStatus.ACTIVE, subscription.getStatus());
    }

    @Test
    void testRenewSubscription_AutoRenewDisabled_ShouldExpire() {
        // Arrange
        Long subscriptionId = 10L;
        Long userId = 20L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(false);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        User user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        // Should not attempt payment or send confirmation
        verify(payOSPaymentService, never()).createPaymentLink(anyLong(), any(), anyString(), anyString(), anyString());
        verify(emailService, never()).sendSubscriptionConfirmation(any(), any());
        // The subscription status should be EXPIRED after expireSubscription
        assertEquals(Subscription.SubscriptionStatus.EXPIRED, subscription.getStatus());
    }

    @Test
    void testRenewSubscription_UserNotFound_ShouldMarkPastDue() {
        // Arrange
        Long subscriptionId = 100L;
        Long userId = 200L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(true);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        when(userRepository.findById(userId)).thenReturn(Optional.empty()); // Simulate user not found
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        assertEquals(Subscription.SubscriptionStatus.PAST_DUE, subscription.getStatus());
    }

    @Test
    void testRenewSubscription_PaymentProviderError_ShouldMarkPastDue() {
        // Arrange
        Long subscriptionId = 101L;
        Long userId = 201L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(true);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        User user = new User();
        user.setId(userId);
        user.setEmail("fail@example.com");
        user.setUsername("failuser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simulate payment provider error (null response)
        when(payOSPaymentService.createPaymentLink(anyLong(), any(), anyString(), anyString(), anyString())).thenReturn(null);
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        assertEquals(Subscription.SubscriptionStatus.PAST_DUE, subscription.getStatus());
    }

    @Test
    void testProcessRenewalPayment_Success() {
        // Arrange
        Long subscriptionId = 300L;
        Long userId = 400L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(true);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        User user = new User();
        user.setId(userId);
        user.setEmail("success@example.com");
        user.setUsername("successuser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simulate successful payment
        vn.payos.type.CheckoutResponseData paymentResponse = mock(vn.payos.type.CheckoutResponseData.class);
        when(paymentResponse.getCheckoutUrl()).thenReturn("http://checkout.url");
        when(payOSPaymentService.createPaymentLink(anyLong(), any(), anyString(), anyString(), anyString())).thenReturn(paymentResponse);
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        assertEquals(Subscription.SubscriptionStatus.ACTIVE, subscription.getStatus());
    }

    @Test
    void testProcessRenewalPayment_Failure() {
        // Arrange
        Long subscriptionId = 301L;
        Long userId = 401L;
        Subscription subscription = new Subscription();
        subscription.setId(subscriptionId);
        subscription.setUserId(userId);
        subscription.setAutoRenew(true);
        subscription.setBillingCycle(Subscription.BillingCycle.MONTHLY);
        subscription.setTier(org.kh.neuralpix.model.SubscriptionTier.BASIC);
        subscription.setPaymentProvider("payos");
        subscription.setPrice(BigDecimal.valueOf(10));
        subscription.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        when(subscriptionRepository.findById(subscriptionId)).thenReturn(Optional.of(subscription));
        User user = new User();
        user.setId(userId);
        user.setEmail("fail2@example.com");
        user.setUsername("failuser2");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        // Simulate failed payment (no checkout URL)
        vn.payos.type.CheckoutResponseData paymentResponse = mock(vn.payos.type.CheckoutResponseData.class);
        when(paymentResponse.getCheckoutUrl()).thenReturn(null);
        when(payOSPaymentService.createPaymentLink(anyLong(), any(), anyString(), anyString(), anyString())).thenReturn(paymentResponse);
        // Act
        subscriptionService.renewSubscription(subscriptionId);
        // Assert
        assertEquals(Subscription.SubscriptionStatus.PAST_DUE, subscription.getStatus());
    }

    @Test
    void testCalculateEndDate_MonthlyAndYearly() throws Exception {
        // Use reflection to access private method
        Method method = SubscriptionServiceImpl.class.getDeclaredMethod("calculateEndDate", Subscription.BillingCycle.class);
        method.setAccessible(true);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthly = (LocalDateTime) method.invoke(subscriptionService, Subscription.BillingCycle.MONTHLY);
        LocalDateTime yearly = (LocalDateTime) method.invoke(subscriptionService, Subscription.BillingCycle.YEARLY);
        // Monthly should be about 1 month from now
        assertTrue(monthly.isAfter(now.plusDays(28)) && monthly.isBefore(now.plusDays(32)));
        // Yearly should be about 1 year from now
        assertTrue(yearly.isAfter(now.plusDays(360)) && yearly.isBefore(now.plusDays(370)));
    }

    @Test
    void testCalculateNextBillingDate_MonthlyAndYearly() throws Exception {
        // Use reflection to access private method
        Method method = SubscriptionServiceImpl.class.getDeclaredMethod("calculateNextBillingDate", Subscription.BillingCycle.class);
        method.setAccessible(true);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthly = (LocalDateTime) method.invoke(subscriptionService, Subscription.BillingCycle.MONTHLY);
        LocalDateTime yearly = (LocalDateTime) method.invoke(subscriptionService, Subscription.BillingCycle.YEARLY);
        // Monthly should be about 1 month from now
        assertTrue(monthly.isAfter(now.plusDays(28)) && monthly.isBefore(now.plusDays(32)));
        // Yearly should be about 1 year from now
        assertTrue(yearly.isAfter(now.plusDays(360)) && yearly.isBefore(now.plusDays(370)));
    }
} 
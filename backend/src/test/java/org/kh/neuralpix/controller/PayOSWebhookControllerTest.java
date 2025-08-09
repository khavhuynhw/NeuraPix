package org.kh.neuralpix.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@WebMvcTest(PayOSWebhookController.class)
class PayOSWebhookControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private org.kh.neuralpix.service.PayOSPaymentService payOSPaymentService;
    @MockBean
    private org.kh.neuralpix.service.SubscriptionService subscriptionService;

    @Test
    void testWebhookProcessing_PaymentSuccess() throws Exception {
        String payload = "{\"status\":\"PAID\",\"externalSubscriptionId\":\"abc123\"}";
        mockMvc.perform(post("/api/v1/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testWebhookProcessing_PaymentFailed() throws Exception {
        String payload = "{\"status\":\"FAILED\",\"externalSubscriptionId\":\"abc123\"}";
        mockMvc.perform(post("/api/v1/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }

    @Test
    void testWebhookProcessing_InvalidStatus() throws Exception {
        String payload = "{\"status\":\"UNKNOWN\",\"externalSubscriptionId\":\"abc123\"}";
        mockMvc.perform(post("/api/v1/payos/webhook")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isOk());
    }
} 
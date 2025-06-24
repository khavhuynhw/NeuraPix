package org.kh.neuralpix.dto.payos;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmWebhookRequestBody {
    private String webhookUrl;
    private PaymentResponseDto data;

    public ConfirmWebhookRequestBody(String webhookUrl,PaymentResponseDto data) {
        this.webhookUrl = webhookUrl;
        this.data = data;
    }
}

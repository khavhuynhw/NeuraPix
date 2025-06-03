package org.kh.neuralpix.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfirmResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    @NotBlank(message = "New password is required")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}

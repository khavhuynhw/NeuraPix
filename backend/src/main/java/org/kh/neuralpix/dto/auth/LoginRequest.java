package org.kh.neuralpix.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

} 
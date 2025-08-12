package org.kh.neuralpix.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String email;
    private String role;
    private Long userId;
} 
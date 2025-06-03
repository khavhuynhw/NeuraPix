package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.auth.*;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    ResetPasswordResponse resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request);
    void confirmResetPassword(ConfirmResetPasswordRequest request);
} 
package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.auth.LoginRequest;
import org.kh.neuralpix.dto.auth.LoginResponse;
import org.kh.neuralpix.dto.auth.RegisterRequest;
import org.kh.neuralpix.dto.auth.ResetPasswordRequest;
import org.kh.neuralpix.dto.auth.ResetPasswordConfirmRequest;
import org.kh.neuralpix.dto.auth.ChangePasswordRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    void resetPassword(ResetPasswordRequest request);
    void resetPasswordConfirm(ResetPasswordConfirmRequest request);
    void changePassword(ChangePasswordRequest request);
} 
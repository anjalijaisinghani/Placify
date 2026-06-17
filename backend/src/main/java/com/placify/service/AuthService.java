package com.placify.service;

import com.placify.dto.auth.AuthResponse;
import com.placify.dto.auth.LoginRequest;
import com.placify.dto.auth.RegisterRequest;
import com.placify.dto.user.UserResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);

    void verifyEmail(String token);

    void verifyOtp(String email, String otp);
}

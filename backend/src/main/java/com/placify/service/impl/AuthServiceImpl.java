package com.placify.service.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.dto.auth.AuthResponse;
import com.placify.dto.auth.LoginRequest;
import com.placify.dto.auth.RegisterRequest;
import com.placify.dto.user.UserResponse;
import com.placify.entity.PasswordResetToken;
import com.placify.entity.Student;
import com.placify.entity.User;
import com.placify.enums.Role;
import com.placify.exception.BadRequestException;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.PasswordResetTokenRepository;
import com.placify.repository.StudentRepository;
import com.placify.repository.UserRepository;
import com.placify.security.JwtUtil;
import com.placify.service.AuthService;
import com.placify.service.EmailService;
import com.placify.entity.RecruiterProfile;
import com.placify.repository.RecruiterProfileRepository;

import com.placify.enums.VerificationStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {


    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;



    @Override
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be created through public registration");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("User email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        if (request.getRole() == Role.RECRUITER) {
            user.setVerificationStatus(VerificationStatus.PENDING);
        } else {
            user.setVerificationStatus(VerificationStatus.APPROVED);
        }
//        user.setEnabled(true);
        user.setEnabled(false);
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.RECRUITER) {

            RecruiterProfile profile = new RecruiterProfile();

            profile.setUser(savedUser);

            profile.setCompany(
                    request.getCompany() != null ?
                            request.getCompany().trim() : null);

            profile.setCompanyWebsite(
                    request.getCompanyWebsite() != null ?
                            request.getCompanyWebsite().trim() : null);

            profile.setPosition(
                    request.getPosition() != null ?
                            request.getPosition().trim() : null);

            profile.setPhoneNumber(
                    request.getPhoneNumber() != null ?
                            request.getPhoneNumber().trim() : null);

            recruiterProfileRepository.save(profile);
        }

        if (savedUser.getRole() == Role.STUDENT) {
            Student student = new Student();
            student.setUser(savedUser);
            student.setSkills(request.getSkills() != null ? request.getSkills().trim() : null);
            student.setResume(request.getResume() != null ? request.getResume().trim() : null);
            student.setBranch(request.getBranch() != null ? request.getBranch().trim() : null);
            Student savedStudent = studentRepository.save(student);
            savedUser.setStudent(savedStudent);
        }


// Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));

        PasswordResetToken otpToken = new PasswordResetToken();
        otpToken.setToken(UUID.randomUUID().toString()); // still needed as PK
        otpToken.setOtp(otp);
        otpToken.setUser(savedUser);
        otpToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpToken.setType("EMAIL_VERIFY");
        passwordResetTokenRepository.save(otpToken);

        emailService.sendOtpEmail(savedUser.getEmail(), savedUser.getName(), otp);



// User must verify email first
        return AuthResponse.builder()
                .token(null)
                .tokenType(null)
                .user(mapUser(savedUser))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // Add this block:
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!user.isEnabled()) {
            throw new BadRequestException(
                    "Your email is not verified. Please check your inbox and verify your account.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        return buildAuthResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapUser(user);
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1));
            resetToken.setType("PASSWORD_RESET");
            passwordResetTokenRepository.save(resetToken);

            String link = frontendUrl + "/reset-password?token=" + resetToken.getToken();
            emailService.sendPasswordReset(user.getEmail(), user.getName(), link);
        });
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset link has expired or already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }


    @Override
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.isEnabled()) {
            throw new BadRequestException("Account is already verified");
        }

        PasswordResetToken otpToken = passwordResetTokenRepository
                .findTopByUserAndTypeOrderByCreatedAtDesc(user, "EMAIL_VERIFY")
                .orElseThrow(() -> new BadRequestException("No verification code found. Please register again."));

        if (otpToken.isUsed() || otpToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Code has expired. Please request a new one.");
        }

        if (!otpToken.getOtp().equals(otp.trim())) {
            throw new BadRequestException("Incorrect verification code.");
        }

        user.setEnabled(true);
        userRepository.save(user);

        otpToken.setUsed(true);
        passwordResetTokenRepository.save(otpToken);
    }
    @Override
    public void verifyEmail(String token) {

        PasswordResetToken verifyToken =
                passwordResetTokenRepository.findByToken(token)
                        .orElseThrow(() ->
                                new BadRequestException("Invalid or expired verification link"));

        if (!"EMAIL_VERIFY".equals(verifyToken.getType())) {
            throw new BadRequestException("Invalid token type");
        }

        if (verifyToken.isUsed()
                || verifyToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException(
                    "Verification link has expired or already been used");
        }

        User user = verifyToken.getUser();

        user.setEnabled(true);
        userRepository.save(user);

        verifyToken.setUsed(true);
        passwordResetTokenRepository.save(verifyToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user))
                .tokenType("Bearer")
                .user(mapUser(user))
                .build();
    }

    private UserResponse mapUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .studentId(user.getStudent() != null ? user.getStudent().getId() : null)
                .verificationStatus(user.getVerificationStatus())
                .build();
    }
}

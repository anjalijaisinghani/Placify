package com.placify.repository;

import java.util.Optional;

import com.placify.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.placify.entity.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findTopByUserAndTypeOrderByCreatedAtDesc(User user, String type);

    void deleteByUserId(Long userId);
}

package com.placify.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.placify.entity.RecruiterProfile;

public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    Optional<RecruiterProfile> findByUserId(Long userId);
    Optional<RecruiterProfile> findByUserEmailIgnoreCase(String email);
}

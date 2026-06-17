package com.placify.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.placify.entity.User;
import com.placify.enums.Role;
import com.placify.enums.VerificationStatus;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    List<User> findByRole(Role role);

    List<User> findByRoleAndVerificationStatus(
            Role role,
            VerificationStatus verificationStatus
    );
}
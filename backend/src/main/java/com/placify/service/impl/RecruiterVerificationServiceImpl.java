package com.placify.service.impl;

import java.util.List;

import com.placify.repository.RecruiterProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.entity.User;
import com.placify.enums.Role;
import com.placify.enums.VerificationStatus;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.UserRepository;
import com.placify.service.RecruiterVerificationService;
import com.placify.dto.admin.PendingRecruiterResponse;
import com.placify.entity.RecruiterProfile;
import com.placify.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RecruiterVerificationServiceImpl
        implements RecruiterVerificationService {
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PendingRecruiterResponse> getPendingRecruiters() {

        return userRepository.findByRoleAndVerificationStatus(
                Role.RECRUITER,
                VerificationStatus.PENDING
        ).stream().map(user -> {

            PendingRecruiterResponse dto =
                    new PendingRecruiterResponse();

            dto.setId(user.getId());
            dto.setName(user.getName());
            dto.setEmail(user.getEmail());
            dto.setVerificationStatus(
                    user.getVerificationStatus().name()
            );

            recruiterProfileRepository
                    .findByUserId(user.getId())
                    .ifPresent(profile -> {

                        dto.setCompany(profile.getCompany());
                        dto.setPosition(profile.getPosition());

                    });

            return dto;

        }).toList();
    }

    @Override
    public void approveRecruiter(Long recruiterId) {

        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Recruiter not found"));

        recruiter.setVerificationStatus(
                VerificationStatus.APPROVED);

        userRepository.save(recruiter);
    }

    @Override
    public void rejectRecruiter(Long recruiterId) {

        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Recruiter not found"));

        recruiter.setVerificationStatus(
                VerificationStatus.REJECTED);

        userRepository.save(recruiter);
    }
}
package com.placify.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.dto.recruiter.RecruiterProfileResponse;
import com.placify.dto.recruiter.RecruiterProfileUpdateRequest;
import com.placify.entity.RecruiterProfile;
import com.placify.entity.User;
import com.placify.exception.ResourceNotFoundException;
import com.placify.repository.RecruiterProfileRepository;
import com.placify.repository.UserRepository;
import com.placify.service.RecruiterProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecruiterProfileServiceImpl implements RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    @Override
    public RecruiterProfileResponse getOwnProfile(String email) {
        User user = getUser(email);
        RecruiterProfile profile = recruiterProfileRepository.findByUserEmailIgnoreCase(email)
                .orElse(null);
        return mapProfile(user, profile);
    }

    @Override
    @Transactional
    public RecruiterProfileResponse updateOwnProfile(String email, RecruiterProfileUpdateRequest request) {
        User user = getUser(email);
        RecruiterProfile profile = recruiterProfileRepository.findByUserEmailIgnoreCase(email)
                .orElseGet(() -> {
                    RecruiterProfile p = new RecruiterProfile();
                    p.setUser(user);
                    return p;
                });

        if (request.getCompany() != null)
            profile.setCompany(request.getCompany().trim());

        if (request.getCompanyWebsite() != null)
            profile.setCompanyWebsite(request.getCompanyWebsite().trim());

        if (request.getPosition() != null)
            profile.setPosition(request.getPosition().trim());

        if (request.getPhoneNumber() != null)
            profile.setPhoneNumber(request.getPhoneNumber().trim());

        if (request.getExperienceYears() != null)
            profile.setExperienceYears(request.getExperienceYears());

        if (request.getBio() != null)
            profile.setBio(request.getBio().trim());

        if (request.getLinkedIn() != null)
            profile.setLinkedIn(request.getLinkedIn().trim());

        if (request.getCompanyVerificationNote() != null)
            profile.setCompanyVerificationNote(
                    request.getCompanyVerificationNote().trim());

        return mapProfile(user, recruiterProfileRepository.save(profile));
    }

    private User getUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private RecruiterProfileResponse mapProfile(User user, RecruiterProfile profile) {
        return RecruiterProfileResponse.builder()
                .id(profile != null ? profile.getId() : null)
                .name(user.getName())
                .email(user.getEmail())
                .company(profile != null ? profile.getCompany() : null)
                .companyWebsite(profile != null ? profile.getCompanyWebsite() : null)
                .position(profile != null ? profile.getPosition() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .companyVerificationNote(
                        profile != null ? profile.getCompanyVerificationNote() : null)
                .experienceYears(profile != null ? profile.getExperienceYears() : null)
                .bio(profile != null ? profile.getBio() : null)
                .linkedIn(profile != null ? profile.getLinkedIn() : null)
                .build();
    }
}

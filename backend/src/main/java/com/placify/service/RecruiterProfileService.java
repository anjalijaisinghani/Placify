package com.placify.service;

import com.placify.dto.recruiter.RecruiterProfileResponse;
import com.placify.dto.recruiter.RecruiterProfileUpdateRequest;

public interface RecruiterProfileService {

    RecruiterProfileResponse getOwnProfile(String email);

    RecruiterProfileResponse updateOwnProfile(String email, RecruiterProfileUpdateRequest request);
}

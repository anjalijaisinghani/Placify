package com.placify.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.placify.dto.common.ApiResponse;
import com.placify.dto.recruiter.RecruiterProfileResponse;
import com.placify.dto.recruiter.RecruiterProfileUpdateRequest;
import com.placify.service.RecruiterProfileService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/recruiters")
@PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
public class RecruiterProfileController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> getOwnProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                ApiResponse.<RecruiterProfileResponse>builder()
                        .success(true)
                        .message("Recruiter profile fetched successfully")
                        .data(recruiterProfileService.getOwnProfile(userDetails.getUsername()))
                        .build()
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<RecruiterProfileResponse>> updateOwnProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RecruiterProfileUpdateRequest request) {
        return ResponseEntity.ok(
                ApiResponse.<RecruiterProfileResponse>builder()
                        .success(true)
                        .message("Recruiter profile updated successfully")
                        .data(recruiterProfileService.updateOwnProfile(userDetails.getUsername(), request))
                        .build()
        );
    }
}

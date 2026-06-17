package com.placify.controller;

import com.placify.dto.admin.PendingRecruiterResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.placify.dto.admin.AdminStatsResponse;
import com.placify.dto.common.ApiResponse;
import com.placify.service.AdminStatsService;


import com.placify.service.RecruiterVerificationService;
import lombok.RequiredArgsConstructor;


import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminStatsService adminStatsService;

    private final RecruiterVerificationService recruiterVerificationService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.<AdminStatsResponse>builder()
                        .success(true)
                        .message("Stats fetched successfully")
                        .data(adminStatsService.getStats())
                        .build()
        );
    }

    @GetMapping("/recruiters/pending")
    public ResponseEntity<ApiResponse<List<PendingRecruiterResponse>>> getPendingRecruiters() {

        return ResponseEntity.ok(
                ApiResponse.<List<PendingRecruiterResponse>>builder()
                        .success(true)
                        .message("Pending recruiters fetched successfully")
                        .data(recruiterVerificationService.getPendingRecruiters())
                        .build()
        );
    }

    @PutMapping("/recruiters/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveRecruiter(
            @PathVariable Long id) {

        recruiterVerificationService.approveRecruiter(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Recruiter approved successfully")
                        .build()
        );
    }

    @PutMapping("/recruiters/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectRecruiter(
            @PathVariable Long id) {

        recruiterVerificationService.rejectRecruiter(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Recruiter rejected successfully")
                        .build()
        );
    }

}

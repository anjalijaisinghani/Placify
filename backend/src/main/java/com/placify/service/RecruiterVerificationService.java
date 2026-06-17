package com.placify.service;

import java.util.List;

import com.placify.entity.User;

import com.placify.dto.admin.PendingRecruiterResponse;

public interface RecruiterVerificationService {

    List<PendingRecruiterResponse> getPendingRecruiters();

    void approveRecruiter(Long recruiterId);

    void rejectRecruiter(Long recruiterId);
}
package com.placify.service;

import java.util.List;

import com.placify.dto.application.ApplicationRequest;
import com.placify.dto.application.ApplicationResponse;
import com.placify.dto.application.ApplicationStatusUpdateRequest;

public interface ApplicationService {

    ApplicationResponse createApplication(String email, ApplicationRequest request);

    List<ApplicationResponse> getAllApplications();

    ApplicationResponse getApplicationById(Long applicationId);

    List<ApplicationResponse> getMyApplications(String email);

    List<ApplicationResponse> getApplicationsByStudent(Long studentId);

    List<ApplicationResponse> getApplicationsByJob(Long jobId);

    ApplicationResponse updateApplicationStatus(Long applicationId, ApplicationStatusUpdateRequest request);

    void deleteApplication(Long applicationId);
}

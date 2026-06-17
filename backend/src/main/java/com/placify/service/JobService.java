package com.placify.service;

import java.util.List;

import com.placify.dto.job.JobRequest;
import com.placify.dto.job.JobResponse;

public interface JobService {

    JobResponse createJob(String email, JobRequest request);

    List<JobResponse> getAllJobs();

    List<JobResponse> getFilteredJobs(String keyword, String location, Long companyId, Boolean active);

    JobResponse getJobById(Long jobId);

    List<JobResponse> getJobsByCompany(Long companyId);

    List<JobResponse> getAvailableJobs(String keyword, String location, Long companyId);

    JobResponse updateJob(Long jobId, String email, JobRequest request);

    void deleteJob(Long jobId, String email);

    JobResponse toggleActive(Long jobId, String email);
}

package com.placify.service.impl;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.placify.dto.admin.AdminStatsResponse;
import com.placify.enums.ApplicationStatus;
import com.placify.repository.ApplicationRepository;
import com.placify.repository.JobRepository;
import com.placify.repository.StudentRepository;
import com.placify.service.AdminStatsService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminStatsServiceImpl implements AdminStatsService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public AdminStatsResponse getStats() {
        long totalStudents = studentRepository.count();
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByActiveTrue();
        long totalApplications = applicationRepository.count();
        long totalPlacements = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        double placementRate = totalStudents > 0
                ? Math.round((double) totalPlacements / totalStudents * 1000.0) / 10.0
                : 0.0;

        List<AdminStatsResponse.CompanyStat> topCompanies = applicationRepository
                .findTopCompaniesByPlacements(PageRequest.of(0, 5))
                .stream()
                .map(row -> new AdminStatsResponse.CompanyStat((String) row[0], (Long) row[1]))
                .toList();

        return AdminStatsResponse.builder()
                .totalStudents(totalStudents)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalApplications(totalApplications)
                .totalPlacements(totalPlacements)
                .placementRate(placementRate)
                .topCompanies(topCompanies)
                .build();
    }
}

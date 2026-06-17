package com.placify.dto.admin;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalStudents;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long totalPlacements;
    private double placementRate;
    private List<CompanyStat> topCompanies;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CompanyStat {
        private String companyName;
        private long placements;
    }
}

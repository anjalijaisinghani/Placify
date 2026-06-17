package com.placify.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.placify.entity.Application;
import com.placify.enums.ApplicationStatus;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndJobId(Long studentId, Long jobId);

    List<Application> findAllByOrderByCreatedAtDesc();

    List<Application> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Application> findByJobIdOrderByCreatedAtDesc(Long jobId);

    long countByStatus(ApplicationStatus status);

    @Query("SELECT a.job.company.name, COUNT(a) as cnt FROM Application a WHERE a.status = com.placify.enums.ApplicationStatus.SELECTED GROUP BY a.job.company.name ORDER BY cnt DESC")
    List<Object[]> findTopCompaniesByPlacements(Pageable pageable);
}

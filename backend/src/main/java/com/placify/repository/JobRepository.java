package com.placify.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.placify.entity.Job;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    List<Job> findAllByOrderByCreatedAtDesc();

    List<Job> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    long countByActiveTrue();
}

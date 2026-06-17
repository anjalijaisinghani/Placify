package com.placify.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.placify.entity.Company;
import com.placify.entity.Job;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class JobSpec {

    private JobSpec() {}

    public static Specification<Job> filter(String keyword, String location, Long companyId, Boolean active) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                Join<Job, Company> co = root.join("company", JoinType.INNER);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(root.get("description")), like),
                        cb.like(cb.lower(root.get("eligibility")), like),
                        cb.like(cb.lower(root.get("location")), like),
                        cb.like(cb.lower(co.get("name")), like),
                        cb.like(cb.lower(root.get("salaryPackage")), like)
                ));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")),
                        "%" + location.trim().toLowerCase() + "%"));
            }

            if (companyId != null) {
                predicates.add(cb.equal(root.get("company").get("id"), companyId));
            }

            if (active != null) {
                predicates.add(cb.equal(root.get("active"), active));
            }

            if (!predicates.isEmpty()) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

package com.placify.service;

import java.util.List;

import com.placify.dto.company.CompanyRequest;
import com.placify.dto.company.CompanyResponse;

public interface CompanyService {

    CompanyResponse createCompany(String email, CompanyRequest request);

    List<CompanyResponse> getAllCompanies();

    CompanyResponse getCompanyById(Long companyId);

    CompanyResponse updateCompany(Long companyId, String email, CompanyRequest request);

    void deleteCompany(Long companyId, String email);
}

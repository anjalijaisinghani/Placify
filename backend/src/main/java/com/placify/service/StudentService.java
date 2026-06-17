package com.placify.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.placify.dto.job.JobResponse;
import com.placify.dto.student.StudentProfileUpdateRequest;
import com.placify.dto.student.StudentRequest;
import com.placify.dto.student.StudentResponse;

public interface StudentService {

    StudentResponse createStudent(StudentRequest request);

    List<StudentResponse> getAllStudents();

    StudentResponse getStudentById(Long studentId);

    StudentResponse getOwnProfile(String email);

    StudentResponse updateStudent(Long studentId, StudentRequest request);

    StudentResponse updateOwnProfile(String email, StudentProfileUpdateRequest request);

    StudentResponse uploadResume(String email, MultipartFile file);

    void deleteStudent(Long studentId);

    void saveJob(String email, Long jobId);

    void unsaveJob(String email, Long jobId);

    List<Long> getSavedJobIds(String email);

    List<JobResponse> getSavedJobs(String email);
}

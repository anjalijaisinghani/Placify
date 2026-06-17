package com.placify.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "user")
@Entity
@Table(name = "recruiter_profiles")
public class RecruiterProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 150)
    private String company;

    @Column(length = 200)
    private String companyWebsite;

    @Column(length = 100)
    private String position;

    @Column(length = 20)
    private String phoneNumber;

    private Integer experienceYears;

    @Column(length = 500)
    private String bio;

    @Column(length = 200)
    private String linkedIn;

    @Column(length = 500)
    private String companyVerificationNote;
}

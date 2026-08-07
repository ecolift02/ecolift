package com.ecolift.entity;

import java.util.HashSet;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserMode currentMode = UserMode.PASSENGER;

    private String profilePictureUrl;

    // Added for the User Profile module. Nullable since existing accounts
    // (created before this change) won't have these set.
    @Column(length = 20)
    private String gender;

    private LocalDate dateOfBirth;

    // Populated automatically by Hibernate on insert only - existing rows
    // will show NULL for createdAt/"Member Since" until re-saved, since
    // there was no created-at tracking before this field was added.
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    private Boolean isDeleted = false;

    // Added for Email OTP Verification (2FA on register). Defaults to false for
    // every new signup; flipped to true once /api/auth/verify-otp succeeds.
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>(); 
}

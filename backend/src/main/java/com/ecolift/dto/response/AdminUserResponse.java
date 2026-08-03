package com.ecolift.dto.response;

import com.ecolift.entity.UserMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Used for both the user list/search view and the user detail view
 * in the Admin Management Module (Module 2 - User Management).
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private LocalDate dateOfBirth;
    private LocalDateTime createdAt;
    private UserMode currentMode;
    private List<String> roles;

    // Mirrors User.isDeleted, which the existing activate/deactivate logic
    // already treats as the account's active/suspended flag.
    private Boolean isSuspended;
}

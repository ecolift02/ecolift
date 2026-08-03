package com.ecolift.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecolift.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    // Added for the Admin Management Module (User Management, Module 2).
    List<User> findByRoles_NameIgnoreCase(String roleName);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR u.phone LIKE CONCAT('%', :keyword, '%')")
    List<User> searchUsers(@Param("keyword") String keyword);

    long countByRoles_NameIgnoreCase(String roleName);
}
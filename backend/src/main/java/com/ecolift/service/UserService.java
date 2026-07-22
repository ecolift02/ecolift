package com.ecolift.service;

import com.ecolift.entity.User;
import java.util.List;

public interface UserService {
    User save(User user);
    User update(Long id, User user);
    void delete(Long id);
    User findById(Long id);
    List<User> findAll();
    boolean exists(Long id);
    long count();

    User registerUser(User user);
    User updateProfile(Long userId, User updatedData);
    void assignRole(Long userId, String roleName);
    void deactivateUser(Long userId);
    void activateUser(Long userId);
    User getDriverProfile(Long driverId);
    User getPassengerProfile(Long passengerId);
}
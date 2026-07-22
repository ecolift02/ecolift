package com.ecolift.service.impl;

import com.ecolift.entity.User;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.RoleService;
import com.ecolift.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;

    public UserServiceImpl(UserRepository userRepository, RoleService roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public User update(Long id, User userDetails) {
        User user = findById(id);
        
        // FIXED: Using single 'name' field and added profile picture update
        user.setName(userDetails.getName());
        user.setPhone(userDetails.getPhone());
        user.setProfilePictureUrl(userDetails.getProfilePictureUrl());
        
        return userRepository.save(user);
    }

    @Override
    public void delete(Long id) {
        User user = findById(id);
        // Mapping deletion to the soft-delete flag
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return userRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return userRepository.count();
    }

    @Override
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + user.getEmail());
        }
        
        // FIXED: Using isDeleted flag instead of active
        user.setIsDeleted(false);
        
        User savedUser = userRepository.save(user);
        assignRole(savedUser.getId(), "PASSENGER"); // Default role
        return savedUser;
    }

    @Override
    public User updateProfile(Long userId, User updatedData) {
        return update(userId, updatedData);
    }

    @Override
    public void assignRole(Long userId, String roleName) {
        User user = findById(userId);
        roleService.assignRoleToUser(user, roleName);
        userRepository.save(user);
    }

    @Override
    public void deactivateUser(Long userId) {
        User user = findById(userId);
        // FIXED: Mapping "deactivate" to setting isDeleted to true
        user.setIsDeleted(true);
        userRepository.save(user);
    }

    @Override
    public void activateUser(Long userId) {
        User user = findById(userId);
        // FIXED: Mapping "activate" to setting isDeleted to false
        user.setIsDeleted(false);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User getDriverProfile(Long driverId) {
        User user = findById(driverId);
        validateHasRole(user, "DRIVER");
        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User getPassengerProfile(Long passengerId) {
        User user = findById(passengerId);
        validateHasRole(user, "PASSENGER");
        return user;
    }

    private void validateHasRole(User user, String roleName) {
        boolean hasRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(roleName));
        if (!hasRole) {
            throw new ResourceNotFoundException("User does not have the required role: " + roleName);
        }
    }
}
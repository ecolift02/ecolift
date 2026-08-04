package com.ecolift.service.impl;

import com.ecolift.entity.User;
import com.ecolift.entity.UserMode;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.RoleService;
import com.ecolift.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
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

        // Added for the User Profile module (gender/dateOfBirth are new,
        // optional fields - see User entity).
        user.setGender(userDetails.getGender());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        
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

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUserMode(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public User updateCurrentMode(String email, UserMode mode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Switching modes is a statement of intent to act in that capacity, so
        // self-grant the matching role if the user doesn't already have it —
        // mirroring how registering a vehicle already auto-grants DRIVER.
        // This keeps Driver <-> Passenger switching symmetric for every account,
        // regardless of which role was chosen at signup.
        boolean hasRequiredRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(mode.name()));
        if (!hasRequiredRole) {
            roleService.assignRoleToUser(user, mode.name());
        }

        user.setCurrentMode(mode);
        return userRepository.save(user);
    }

    private void validateHasRole(User user, String roleName) {
        boolean hasRole = user.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(roleName));
        if (!hasRole) {
            throw new ResourceNotFoundException("User does not have the required role: " + roleName);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public User getProfile(Long userId) {
        // Thin wrapper over findById - named for this feature so the intent
        // is clear at the call site in UserController.
        return findById(userId);
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = findById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User updateProfilePicture(Long userId, String pictureUrl) {
        User user = findById(userId);
        user.setProfilePictureUrl(pictureUrl);
        return userRepository.save(user);
    }
}
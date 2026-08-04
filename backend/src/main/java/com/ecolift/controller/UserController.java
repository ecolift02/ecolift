package com.ecolift.controller;

import com.ecolift.dto.request.ChangePasswordRequest;
import com.ecolift.dto.request.CurrentModeRequest;
import com.ecolift.dto.request.UpdateProfileRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.dto.response.CurrentModeResponse;
import com.ecolift.dto.response.ProfileResponse;
import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.service.AuthService;
import com.ecolift.service.BookingService;
import com.ecolift.service.RideService;
import com.ecolift.service.ReviewService;
import com.ecolift.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;
    private final com.ecolift.service.FileStorageService fileStorageService;
    // Added for the Profile module's account-statistics section - all three
    // are existing services, reused as-is (no new repository queries).
    private final BookingService bookingService;
    private final RideService rideService;
    private final ReviewService reviewService;

    @GetMapping("/current-mode")
    public ResponseEntity<CurrentModeResponse> getCurrentMode(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getCurrentUserMode(email);

        return ResponseEntity.ok(CurrentModeResponse.builder()
                .success(true)
                .mode(user.getCurrentMode())
                .build());
    }

    @PutMapping("/current-mode")
    public ResponseEntity<CurrentModeResponse> updateCurrentMode(
            @Valid @RequestBody CurrentModeRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userService.updateCurrentMode(email, request.getMode());

        // Switching modes can grant a new role (see UserServiceImpl), which makes
        // the token issued at login stale. Re-issue it here so the frontend can
        // update its stored token/roles in the same round trip.
        AuthResponse refreshed = authService.refreshToken(email);

        return ResponseEntity.ok(CurrentModeResponse.builder()
                .success(true)
                .mode(user.getCurrentMode())
                .token(refreshed.getToken())
                .roles(refreshed.getRoles())
                .build());
    }

    /**
     * Powers the /profile page: returns the full profile of whoever the JWT
     * belongs to. "Authentication" is populated by JwtAuthenticationFilter
     * from the token on every request, so there's no {id}/{email} path
     * variable to guess - a user can only ever fetch their own profile.
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        User user = resolveCurrentUser(authentication);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    /**
     * Backs the "Edit Profile" action. Deliberately narrow: only name, phone,
     * gender, dateOfBirth, and profilePictureUrl are editable here. Email is
     * the login identifier and currentMode has its own dedicated endpoint
     * above, so neither belongs in this generic profile-edit form.
     */
    /**
     * Handles clicking the profile picture and choosing a new image.
     * multipart/form-data with a single "file" part. Saves to disk via
     * FileStorageService, then persists just the resulting URL.
     */
    @PostMapping(value = "/profile/picture", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadProfilePicture(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication
    ) {
        User currentUser = resolveCurrentUser(authentication);
        String pictureUrl = fileStorageService.storeProfilePicture(file, currentUser.getId());
        User updated = userService.updateProfilePicture(currentUser.getId(), pictureUrl);
        return ResponseEntity.ok(toProfileResponse(updated));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        User currentUser = resolveCurrentUser(authentication);

        // If the form leaves phone/profilePictureUrl blank, keep the existing
        // value rather than overwrite with "" - phone is a unique column, so
        // two users both saving "" would otherwise crash on the second save.
        String phone = (request.getPhone() == null || request.getPhone().isBlank())
                ? currentUser.getPhone()
                : request.getPhone();
        String profilePictureUrl = (request.getProfilePictureUrl() == null || request.getProfilePictureUrl().isBlank())
                ? currentUser.getProfilePictureUrl()
                : request.getProfilePictureUrl();

        User updatedData = User.builder()
                .name(request.getName())
                .phone(phone)
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .profilePictureUrl(profilePictureUrl)
                .build();

        User updated = userService.updateProfile(currentUser.getId(), updatedData);
        return ResponseEntity.ok(toProfileResponse(updated));
    }

    /**
     * Account Settings > Change Password. Requires the current password to
     * be re-entered, verified via the same PasswordEncoder used at login.
     */
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        User currentUser = resolveCurrentUser(authentication);
        userService.changePassword(currentUser.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    private User resolveCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        return userService.getCurrentUserMode(email); // fetches the full User by email
    }

    private ProfileResponse toProfileResponse(User user) {
        java.util.List<com.ecolift.entity.Booking> passengerBookings = bookingService.getBookingsByPassenger(user.getId());
        int totalBookings = passengerBookings.size();
        long completedTrips = passengerBookings.stream()
                .filter(b -> b.getStatus() == com.ecolift.entity.Booking.BookingStatus.COMPLETED)
                .count();
        int publishedRides = rideService.getDriverRides(user.getId()).size();

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .profilePictureUrl(user.getProfilePictureUrl())
                .joinedDate(user.getCreatedAt())
                .currentMode(user.getCurrentMode())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .totalBookings(totalBookings)
                .publishedRides(publishedRides)
                .completedTrips((int) completedTrips)
                .averageRating(reviewService.calculateAverageRating(user.getId()))
                .build();
    }
}
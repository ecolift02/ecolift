package com.ecolift.service;

import com.ecolift.dto.request.AuthRequest;
import com.ecolift.dto.request.RegisterRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.entity.UserMode;
import com.ecolift.repository.RoleRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use.");
        }

        // 2. Resolve the role the user actually selected on the registration form
        //    ("DRIVER" or "PASSENGER"). Defaults to PASSENGER if not provided/invalid.
        //    NOTE: previously this was hardcoded to "USER", which meant every new
        //    account ignored the Driver/Passenger choice entirely.
        String requestedRole = request.getRole() != null
                ? request.getRole().trim().toUpperCase()
                : "PASSENGER";

        UserMode initialMode = "DRIVER".equals(requestedRole) ? UserMode.DRIVER : UserMode.PASSENGER;
        String roleName = "DRIVER".equals(requestedRole) ? "DRIVER" : "PASSENGER";

        Role userRole = getOrCreateRole(roleName);

        // 3. Build and save new User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .currentMode(initialMode)
                .profilePictureUrl(request.getProfilePictureUrl())
                .build();

        userRepository.save(user);

        // 4. Generate JWT and map to response
        return generateAuthResponse(user);
    }

    public AuthResponse authenticate(AuthRequest request) {
        // 1. Authenticate credentials via Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Fetch user and generate JWT
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        return generateAuthResponse(user);
    }

    /**
     * Re-issues a fresh JWT (with up-to-date roles) for an already-authenticated user.
     * Needed because roles can change mid-session (e.g. registering a vehicle grants
     * the DRIVER role), and the original token issued at login won't reflect that
     * until a new one is generated.
     */
    public AuthResponse refreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return generateAuthResponse(user);
    }

    /**
     * Looks up a role by name, self-healing by creating it if it doesn't exist yet.
     * This avoids registration hard-crashing in environments where the roles table
     * hasn't been manually seeded with "DRIVER"/"PASSENGER" rows.
     */
    private Role getOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    return roleRepository.save(role);
                });
    }

    private AuthResponse generateAuthResponse(User user) {
        // We pass the Spring Security UserDetails representation to our JwtService
        org.springframework.security.core.userdetails.User springUser = 
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), 
                        user.getPassword(), 
                        user.getRoles().stream()
                                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.getName()))
                                .collect(Collectors.toList())
                );
                
        String jwtToken = jwtService.generateToken(springUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
               .name(user.getName())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }
}
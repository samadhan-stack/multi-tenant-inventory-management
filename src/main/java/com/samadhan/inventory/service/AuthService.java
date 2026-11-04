package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.AuthResponse;
import com.samadhan.inventory.dto.LoginRequest;
import com.samadhan.inventory.dto.RegisterRequest;

import com.samadhan.inventory.entity.Role;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;

import com.samadhan.inventory.repository.TenantRepository;
import com.samadhan.inventory.repository.UserRepository;

import com.samadhan.inventory.security.JwtService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            TenantRepository tenantRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (tenantRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Company email already registered");
        }

        Tenant tenant = new Tenant(
                request.companyName(),
                request.email()
        );

        tenantRepository.save(tenant);

        User user = new User(
                request.fullName(),
                request.email(),
                passwordEncoder.encode(request.password()),
                Role.ADMIN,
                tenant
        );

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                user.getEmail(),
                user.getRole().name(),
                tenant.getId()
        );
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                user.getEmail(),
                user.getRole().name(),
                user.getTenant().getId()
        );
    }
}
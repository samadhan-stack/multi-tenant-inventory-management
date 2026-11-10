package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.CreateUserRequest;
import com.samadhan.inventory.dto.UpdateUserRoleRequest;
import com.samadhan.inventory.dto.UpdateUserStatusRequest;
import com.samadhan.inventory.dto.UserResponse;

import com.samadhan.inventory.entity.Role;
import com.samadhan.inventory.entity.User;

import com.samadhan.inventory.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse createUser(
            CreateUserRequest request,
            User admin) {

        if (request.role() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "You can only create MANAGER or STAFF accounts"
            );
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = new User(
                request.fullName().trim(),
                email,
                passwordEncoder.encode(request.password()),
                request.role(),
                admin.getTenant()
        );

        return mapToResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(User admin) {

        Long tenantId = admin.getTenant().getId();

        return userRepository
                .findAllByTenant_IdOrderByIdDesc(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(
            Long userId,
            UpdateUserRoleRequest request,
            User admin) {

        if (request.role() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Employee role cannot be changed to ADMIN"
            );
        }

        User employee = findEmployee(userId, admin);

        if (employee.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Admin account role cannot be changed"
            );
        }

        employee.setRole(request.role());

        return mapToResponse(userRepository.save(employee));
    }

    @Transactional
    public UserResponse updateUserStatus(
            Long userId,
            UpdateUserStatusRequest request,
            User admin) {

        User employee = findEmployee(userId, admin);

        if (employee.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException(
                    "Admin account status cannot be changed here"
            );
        }

        if (employee.getId().equals(admin.getId())) {
            throw new IllegalArgumentException(
                    "You cannot deactivate your own account"
            );
        }

        employee.setActive(request.active());

        return mapToResponse(userRepository.save(employee));
    }

    private User findEmployee(Long userId, User admin) {

        return userRepository
                .findByIdAndTenant_Id(
                        userId,
                        admin.getTenant().getId()
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found in your company"
                        )
                );
    }

    private UserResponse mapToResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.isActive()
        );
    }
}
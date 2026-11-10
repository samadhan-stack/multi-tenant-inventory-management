package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.CreateUserRequest;
import com.samadhan.inventory.dto.UpdateUserRoleRequest;
import com.samadhan.inventory.dto.UpdateUserStatusRequest;
import com.samadhan.inventory.dto.UserResponse;

import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal User admin) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.createUser(request, admin));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @AuthenticationPrincipal User admin) {

        return ResponseEntity.ok(
                userService.getAllUsers(admin)
        );
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal User admin) {

        return ResponseEntity.ok(
                userService.updateUserRole(userId, request, admin)
        );
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserResponse> updateStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal User admin) {

        return ResponseEntity.ok(
                userService.updateUserStatus(userId, request, admin)
        );
    }
}
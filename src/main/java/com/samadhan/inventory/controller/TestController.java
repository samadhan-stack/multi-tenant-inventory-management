package com.samadhan.inventory.controller;

import com.samadhan.inventory.entity.User;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/protected")
    public String protectedEndpoint(
            @AuthenticationPrincipal User user) {

        return "Welcome " + user.getFullName()
                + "! You are authenticated.";
    }
}
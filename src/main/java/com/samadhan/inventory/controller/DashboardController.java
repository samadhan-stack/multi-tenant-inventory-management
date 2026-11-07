
package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.DashboardResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.DashboardService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(
            @AuthenticationPrincipal User user) {

        return dashboardService.getDashboard(user);
    }
}

package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.StockMovementRequest;
import com.samadhan.inventory.dto.StockMovementResponse;

import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.StockService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping("/products/{productId}/stock-movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public StockMovementResponse recordMovement(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request,
            @AuthenticationPrincipal User user) {

        return stockService.recordMovement(
                productId, request, user
        );
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public List<StockMovementResponse> getAllMovements(
            @AuthenticationPrincipal User user) {

        return stockService.getAllMovements(user);
    }

    @GetMapping("/products/{productId}/stock-movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public List<StockMovementResponse> getProductMovements(
            @PathVariable Long productId,
            @AuthenticationPrincipal User user) {

        return stockService.getProductMovements(productId, user);
    }
}
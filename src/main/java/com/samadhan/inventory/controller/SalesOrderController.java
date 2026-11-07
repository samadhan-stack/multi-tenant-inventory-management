
package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.SalesOrderRequest;
import com.samadhan.inventory.dto.SalesOrderResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.SalesOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(
            SalesOrderService salesOrderService) {

        this.salesOrderService = salesOrderService;
    }

    // 1. Create Sales Order
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SalesOrderResponse createSalesOrder(
            @Valid @RequestBody SalesOrderRequest request,
            @AuthenticationPrincipal User user) {

        return salesOrderService.createSalesOrder(request, user);
    }

    // 2. Get All Sales Orders
    @GetMapping
    public List<SalesOrderResponse> getAllSalesOrders(
            @AuthenticationPrincipal User user) {

        return salesOrderService.getAllSalesOrders(user);
    }

    // 3. Get Sales Order By ID
    @GetMapping("/{id}")
    public SalesOrderResponse getSalesOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return salesOrderService.getSalesOrderById(id, user);
    }

    // 4. Confirm Sales Order
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SalesOrderResponse confirmSalesOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return salesOrderService.confirmSalesOrder(id, user);
    }

    // 5. Dispatch Sales Order
    @PatchMapping("/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SalesOrderResponse dispatchSalesOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return salesOrderService.dispatchSalesOrder(id, user);
    }

    // 6. Cancel Sales Order
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SalesOrderResponse cancelSalesOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return salesOrderService.cancelSalesOrder(id, user);
    }
}

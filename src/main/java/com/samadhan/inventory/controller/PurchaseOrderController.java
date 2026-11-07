package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.PurchaseOrderRequest;
import com.samadhan.inventory.dto.PurchaseOrderResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.PurchaseOrderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(
            PurchaseOrderService purchaseOrderService
    ) {
        this.purchaseOrderService = purchaseOrderService;
    }

    // 1. Create Purchase Order

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public PurchaseOrderResponse createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request,
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.createPurchaseOrder(request, user);
    }


    // 2. Get All Purchase Orders

    @GetMapping
    public List<PurchaseOrderResponse> getAllPurchaseOrders(
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.getAllPurchaseOrders(user);
    }


    // 3. Get Purchase Order By ID

    @GetMapping("/{id}")
    public PurchaseOrderResponse getPurchaseOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.getPurchaseOrderById(id, user);
    }


    // 4. Confirm Purchase Order

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public PurchaseOrderResponse confirmPurchaseOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.confirmPurchaseOrder(id, user);
    }


    // 5. Receive Purchase Order

    @PatchMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public PurchaseOrderResponse receivePurchaseOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.receivePurchaseOrder(id, user);
    }


    // 6. Cancel Purchase Order

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public PurchaseOrderResponse cancelPurchaseOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        return purchaseOrderService.cancelPurchaseOrder(id, user);
    }
}
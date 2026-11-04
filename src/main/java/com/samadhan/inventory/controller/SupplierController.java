package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.SupplierRequest;
import com.samadhan.inventory.dto.SupplierResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SupplierResponse createSupplier(
            @Valid @RequestBody SupplierRequest request,
            @AuthenticationPrincipal User user
    ) {
        return supplierService.createSupplier(request, user);
    }

    @GetMapping
    public List<SupplierResponse> getAllSuppliers(
            @AuthenticationPrincipal User user
    ) {
        return supplierService.getAllSuppliers(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public SupplierResponse updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request,
            @AuthenticationPrincipal User user
    ) {
        return supplierService.updateSupplier(id, request, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSupplier(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        supplierService.deleteSupplier(id, user);
    }
}
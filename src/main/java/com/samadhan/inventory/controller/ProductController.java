package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.ProductRequest;
import com.samadhan.inventory.dto.ProductResponse;

import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ProductResponse createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {

        return productService.createProduct(request, user);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public List<ProductResponse> getAllProducts(
            @AuthenticationPrincipal User user) {

        return productService.getAllProducts(user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ProductResponse getProductById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return productService.getProductById(id, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {

        return productService.updateProduct(id, request, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        productService.deleteProduct(id, user);
    }
}
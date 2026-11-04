package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.CategoryRequest;
import com.samadhan.inventory.dto.CategoryResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public CategoryResponse createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return categoryService.createCategory(request, user);
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories(
            @AuthenticationPrincipal User user
    ) {
        return categoryService.getAllCategories(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public CategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return categoryService.updateCategory(id, request, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        categoryService.deleteCategory(id, user);
    }
}
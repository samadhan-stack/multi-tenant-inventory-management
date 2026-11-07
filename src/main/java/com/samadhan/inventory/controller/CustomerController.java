package com.samadhan.inventory.controller;

import com.samadhan.inventory.dto.CustomerRequest;
import com.samadhan.inventory.dto.CustomerResponse;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public CustomerResponse createCustomer(
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal User user) {

        return customerService.createCustomer(request, user);
    }

    @GetMapping
    public List<CustomerResponse> getAllCustomers(
            @AuthenticationPrincipal User user) {

        return customerService.getAllCustomers(user);
    }

    @GetMapping("/{id}")
    public CustomerResponse getCustomerById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        return customerService.getCustomerById(id, user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public CustomerResponse updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request,
            @AuthenticationPrincipal User user) {

        return customerService.updateCustomer(id, request, user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomer(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        customerService.deleteCustomer(id, user);
    }
}
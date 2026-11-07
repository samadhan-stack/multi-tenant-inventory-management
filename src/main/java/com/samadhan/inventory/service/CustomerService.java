package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.CustomerRequest;
import com.samadhan.inventory.dto.CustomerResponse;
import com.samadhan.inventory.entity.Customer;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.repository.CustomerRepository;
import com.samadhan.inventory.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;

    public CustomerService(
            CustomerRepository customerRepository,
            TenantRepository tenantRepository) {

        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional
    public CustomerResponse createCustomer(
            CustomerRequest request,
            User user) {

        Long tenantId = user.getTenant().getId();

        String email = normalizeEmail(request.email());

        if (email != null &&
                customerRepository.existsByEmailAndTenant_Id(
                        email, tenantId)) {

            throw new IllegalArgumentException(
                    "Customer email already exists"
            );
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Tenant not found"));

        Customer customer = new Customer(
                request.name(),
                email,
                request.phone(),
                request.address(),
                tenant
        );

        return mapToResponse(customerRepository.save(customer));
    }

    public List<CustomerResponse> getAllCustomers(User user) {

        Long tenantId = user.getTenant().getId();

        return customerRepository.findAllByTenant_Id(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(
            Long customerId,
            User user) {

        Long tenantId = user.getTenant().getId();

        Customer customer = customerRepository
                .findByIdAndTenant_Id(customerId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Customer not found"));

        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(
            Long customerId,
            CustomerRequest request,
            User user) {

        Long tenantId = user.getTenant().getId();

        Customer customer = customerRepository
                .findByIdAndTenant_Id(customerId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Customer not found"));

        String email = normalizeEmail(request.email());

        if (email != null &&
                customerRepository.existsByEmailAndTenant_IdAndIdNot(
                        email, tenantId, customerId)) {

            throw new IllegalArgumentException(
                    "Customer email already exists"
            );
        }

        customer.setName(request.name());
        customer.setEmail(email);
        customer.setPhone(request.phone());
        customer.setAddress(request.address());

        return mapToResponse(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long customerId, User user) {

        Long tenantId = user.getTenant().getId();

        Customer customer = customerRepository
                .findByIdAndTenant_Id(customerId, tenantId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Customer not found"));

        customerRepository.delete(customer);
    }

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase();
    }

    private CustomerResponse mapToResponse(Customer customer) {

        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress()
        );
    }
}
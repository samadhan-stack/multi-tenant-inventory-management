package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.SupplierRequest;
import com.samadhan.inventory.dto.SupplierResponse;
import com.samadhan.inventory.entity.Supplier;
import com.samadhan.inventory.entity.Tenant;
import com.samadhan.inventory.entity.User;
import com.samadhan.inventory.repository.SupplierRepository;
import com.samadhan.inventory.repository.TenantRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final TenantRepository tenantRepository;

    public SupplierService(
            SupplierRepository supplierRepository,
            TenantRepository tenantRepository
    ) {
        this.supplierRepository = supplierRepository;
        this.tenantRepository = tenantRepository;
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request, User user) {

        Long tenantId = user.getTenant().getId();

        if (request.email() != null && !request.email().isBlank()
                && supplierRepository.existsByEmailAndTenant_Id(
                request.email(), tenantId)) {
            throw new IllegalArgumentException("Supplier email already exists");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Supplier supplier = new Supplier(
                request.name(),
                request.email(),
                request.phone(),
                request.address(),
                tenant
        );

        return mapToResponse(supplierRepository.save(supplier));
    }

    public List<SupplierResponse> getAllSuppliers(User user) {

        Long tenantId = user.getTenant().getId();

        return supplierRepository.findAllByTenant_Id(tenantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public SupplierResponse updateSupplier(
            Long supplierId,
            SupplierRequest request,
            User user
    ) {

        Long tenantId = user.getTenant().getId();

        Supplier supplier = supplierRepository
                .findByIdAndTenant_Id(supplierId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        if (request.email() != null && !request.email().isBlank()
                && supplierRepository.existsByEmailAndTenant_IdAndIdNot(
                request.email(), tenantId, supplierId)) {
            throw new IllegalArgumentException("Supplier email already exists");
        }

        supplier.setName(request.name());
        supplier.setEmail(request.email());
        supplier.setPhone(request.phone());
        supplier.setAddress(request.address());

        return mapToResponse(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Long supplierId, User user) {

        Long tenantId = user.getTenant().getId();

        Supplier supplier = supplierRepository
                .findByIdAndTenant_Id(supplierId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        supplierRepository.delete(supplier);
    }

    private SupplierResponse mapToResponse(Supplier supplier) {

        return new SupplierResponse(
                supplier.getId(),
                supplier.getName(),
                supplier.getEmail(),
                supplier.getPhone(),
                supplier.getAddress()
        );
    }
}
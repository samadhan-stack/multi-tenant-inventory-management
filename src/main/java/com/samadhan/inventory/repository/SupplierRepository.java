package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplierRepository
        extends JpaRepository<Supplier, Long> {

    List<Supplier> findAllByTenant_Id(Long tenantId);
}
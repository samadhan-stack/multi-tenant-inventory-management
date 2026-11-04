package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    List<Product> findAllByTenant_Id(Long tenantId);

    Optional<Product> findByIdAndTenant_Id(
            Long id, Long tenantId
    );

    boolean existsBySkuAndTenant_Id(
            String sku, Long tenantId
    );

    boolean existsBySkuAndTenant_IdAndIdNot(
            String sku, Long tenantId, Long id
    );
}
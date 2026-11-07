package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );

    Optional<PurchaseOrder> findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );

    boolean existsByOrderNumberAndTenant_Id(
            String orderNumber,
            Long tenantId
    );
}
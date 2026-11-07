package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository
        extends JpaRepository<SalesOrder, Long> {

    List<SalesOrder> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );

    Optional<SalesOrder> findByIdAndTenant_Id(
            Long id,
            Long tenantId
    );

    boolean existsByOrderNumberAndTenant_Id(
            String orderNumber,
            Long tenantId
    );
}
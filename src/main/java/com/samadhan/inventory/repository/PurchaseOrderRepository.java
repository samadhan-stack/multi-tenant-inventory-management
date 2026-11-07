
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.PurchaseOrder;
import com.samadhan.inventory.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository
        extends JpaRepository<PurchaseOrder, Long> {

    List<PurchaseOrder> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );

    Optional<PurchaseOrder> findByIdAndTenant_Id(
            Long id, Long tenantId
    );

    boolean existsByOrderNumberAndTenant_Id(
            String orderNumber, Long tenantId
    );

    long countByTenant_Id(Long tenantId);

    long countByTenant_IdAndStatus(
            Long tenantId, PurchaseOrderStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(p.totalAmount), 0)
            FROM PurchaseOrder p
            WHERE p.tenant.id = :tenantId
            AND p.status = :status
            """)
    BigDecimal calculateTotalByStatus(
            @Param("tenantId") Long tenantId,
            @Param("status") PurchaseOrderStatus status
    );
}

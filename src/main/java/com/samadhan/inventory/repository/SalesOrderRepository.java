
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.SalesOrder;
import com.samadhan.inventory.entity.SalesOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository
        extends JpaRepository<SalesOrder, Long> {

    List<SalesOrder> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );

    Optional<SalesOrder> findByIdAndTenant_Id(
            Long id, Long tenantId
    );

    boolean existsByOrderNumberAndTenant_Id(
            String orderNumber, Long tenantId
    );

    long countByTenant_Id(Long tenantId);

    long countByTenant_IdAndStatus(
            Long tenantId, SalesOrderStatus status
    );

    @Query("""
            SELECT COALESCE(SUM(s.totalAmount), 0)
            FROM SalesOrder s
            WHERE s.tenant.id = :tenantId
            AND s.status = :status
            """)
    BigDecimal calculateTotalByStatus(
            @Param("tenantId") Long tenantId,
            @Param("status") SalesOrderStatus status
    );
}

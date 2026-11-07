
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );

    List<StockMovement>
    findAllByProduct_IdAndTenant_IdOrderByCreatedAtDesc(
            Long productId,
            Long tenantId
    );

    // Fetch only the latest 10 movements
    List<StockMovement> findTop10ByTenant_IdOrderByCreatedAtDesc(
            Long tenantId
    );
}

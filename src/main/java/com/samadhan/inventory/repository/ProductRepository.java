
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByTenant_Id(Long tenantId);

    Optional<Product> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsBySkuAndTenant_Id(String sku, Long tenantId);

    boolean existsBySkuAndTenant_IdAndIdNot(
            String sku, Long tenantId, Long id
    );

    // Total products
    long countByTenant_Id(Long tenantId);

    // Low stock products: quantity between 1 and threshold
    long countByTenant_IdAndStockQuantityBetween(
            Long tenantId, Integer minimum, Integer maximum
    );

    // Out of stock products
    long countByTenant_IdAndStockQuantity(
            Long tenantId, Integer stockQuantity
    );

    // Total inventory valuation
    @Query("""
            SELECT COALESCE(SUM(p.price * p.stockQuantity), 0)
            FROM Product p
            WHERE p.tenant.id = :tenantId
            """)
    BigDecimal calculateInventoryValue(
            @Param("tenantId") Long tenantId
    );

    boolean existsByCategory_IdAndTenant_Id(Long categoryId, Long tenantId);
}

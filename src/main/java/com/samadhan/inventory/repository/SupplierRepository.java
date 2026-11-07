
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    List<Supplier> findAllByTenant_Id(Long tenantId);

    Optional<Supplier> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByEmailAndTenant_Id(String email, Long tenantId);

    boolean existsByEmailAndTenant_IdAndIdNot(
            String email, Long tenantId, Long id
    );

    long countByTenant_Id(Long tenantId);
}

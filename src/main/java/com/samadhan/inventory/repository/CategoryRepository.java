package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findAllByTenant_Id(Long tenantId);

    Optional<Category> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByNameAndTenant_Id(String name, Long tenantId);

    boolean existsByNameAndTenant_IdAndIdNot(
            String name, Long tenantId, Long id
    );
}
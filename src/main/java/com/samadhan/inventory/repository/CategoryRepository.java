package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findAllByTenant_Id(Long tenantId);

    boolean existsByNameAndTenant_Id(
            String name, Long tenantId
    );
}
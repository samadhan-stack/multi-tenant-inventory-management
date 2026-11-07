package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findAllByTenant_Id(Long tenantId);

    Optional<Customer> findByIdAndTenant_Id(Long id, Long tenantId);

    boolean existsByEmailAndTenant_Id(String email, Long tenantId);

    boolean existsByEmailAndTenant_IdAndIdNot(
            String email,
            Long tenantId,
            Long id
    );
}
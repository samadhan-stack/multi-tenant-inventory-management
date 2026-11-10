package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "tenant")
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByTenant_IdOrderByIdDesc(Long tenantId);

    Optional<User> findByIdAndTenant_Id(Long id, Long tenantId);
}
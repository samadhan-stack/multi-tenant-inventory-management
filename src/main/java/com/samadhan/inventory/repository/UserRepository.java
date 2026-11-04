package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "tenant")
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
package com.samadhan.inventory.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "categories",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"tenant_id", "name"})
        }
)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    public Category() {
    }

    public Category(String name, Tenant tenant) {
        this.name = name;
        this.tenant = tenant;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setName(String name) {
        this.name = name;
    }
}
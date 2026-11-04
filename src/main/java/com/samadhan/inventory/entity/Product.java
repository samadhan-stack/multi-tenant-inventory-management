package com.samadhan.inventory.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(
        name = "products",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"tenant_id", "sku"}
                )
        }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String sku;

    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Version
    private Long version;

    public Product() {
    }

    public Product(String name, String sku, String description,
                   BigDecimal price, Integer stockQuantity,
                   Tenant tenant) {

        this.name = name;
        this.sku = sku;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.tenant = tenant;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public Long getVersion() {
        return version;
    }

    public void updateDetails(
            String name,
            String sku,
            String description,
            BigDecimal price) {

        this.name = name;
        this.sku = sku;
        this.description = description;
        this.price = price;
    }

    public void changeStock(int quantity) {

        int updatedStock = this.stockQuantity + quantity;

        if (updatedStock < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock available"
            );
        }

        this.stockQuantity = updatedStock;
    }
}
package com.samadhan.inventory.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    public Supplier() {
    }

    public Supplier(
            String name,
            String email,
            String phone,
            String address,
            Tenant tenant) {

        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.tenant = tenant;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public Tenant getTenant() {
        return tenant;
    }
}
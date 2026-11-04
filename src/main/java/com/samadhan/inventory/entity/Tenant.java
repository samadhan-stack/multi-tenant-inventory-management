package com.samadhan.inventory.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false, unique = true)
    private String email;

    public Tenant() {
    }

    public Tenant(String companyName, String email) {
        this.companyName = companyName;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getEmail() {
        return email;
    }
}
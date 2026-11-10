package com.samadhan.inventory.entity;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private boolean active = true;

    public User() {
    }

    public User(String fullName, String email,
                String password, Role role, Tenant tenant) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.tenant = tenant;
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
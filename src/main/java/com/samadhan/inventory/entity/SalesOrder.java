package com.samadhan.inventory.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "sales_orders",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"tenant_id", "order_number"}
                )
        }
)
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalesOrderStatus status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Version
    private Long version;

    @OneToMany(
            mappedBy = "salesOrder",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SalesOrderItem> items = new ArrayList<>();

    public SalesOrder() {
    }

    public SalesOrder(
            String orderNumber,
            Customer customer,
            Tenant tenant,
            User createdBy) {

        this.orderNumber = orderNumber;
        this.customer = customer;
        this.tenant = tenant;
        this.createdBy = createdBy;
        this.status = SalesOrderStatus.DRAFT;
        this.totalAmount = BigDecimal.ZERO;
        this.createdAt = LocalDateTime.now();
    }

    public void addItem(SalesOrderItem item) {
        items.add(item);
        item.setSalesOrder(this);
    }

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public SalesOrderStatus getStatus() {
        return status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<SalesOrderItem> getItems() {
        return items;
    }

    public Long getVersion() {
        return version;
    }

    public void setStatus(SalesOrderStatus status) {
        this.status = status;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
package com.samadhan.inventory.repository;

import com.samadhan.inventory.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderItemRepository
        extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findAllByPurchaseOrder_Id(Long purchaseOrderId);
}
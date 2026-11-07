package com.samadhan.inventory.dto;

import com.samadhan.inventory.entity.SalesOrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SalesOrderResponse(

        Long id,
        String orderNumber,
        Long customerId,
        String customerName,
        SalesOrderStatus status,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        List<SalesOrderItemResponse> items

) {}
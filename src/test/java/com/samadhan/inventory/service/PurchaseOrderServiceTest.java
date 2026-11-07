package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.PurchaseOrderItemRequest;
import com.samadhan.inventory.dto.PurchaseOrderRequest;
import com.samadhan.inventory.dto.PurchaseOrderResponse;
import com.samadhan.inventory.entity.*;
import com.samadhan.inventory.exception.BusinessRuleException;
import com.samadhan.inventory.exception.ResourceNotFoundException;
import com.samadhan.inventory.repository.PurchaseOrderRepository;
import com.samadhan.inventory.repository.ProductRepository;
import com.samadhan.inventory.repository.SupplierRepository;
import com.samadhan.inventory.repository.StockMovementRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private User user;

    @Mock
    private Tenant tenant;

    @Mock
    private Supplier supplier;

    @Mock
    private Product product;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    @BeforeEach
    void setUp() {
        when(user.getTenant()).thenReturn(tenant);
        when(tenant.getId()).thenReturn(1L);

        when(supplier.getId()).thenReturn(10L);
        when(supplier.getName()).thenReturn("ABC Suppliers");

        when(product.getId()).thenReturn(20L);
        when(product.getName()).thenReturn("Keyboard");
        when(product.getSku()).thenReturn("KEY-001");
    }

    // Test 1: Create purchase order successfully
    @Test
    void createPurchaseOrder_shouldCalculateTotalAmount() {

        PurchaseOrderItemRequest itemRequest =
                new PurchaseOrderItemRequest(
                        20L,
                        2,
                        new BigDecimal("100.00")
                );

        PurchaseOrderRequest request =
                new PurchaseOrderRequest(
                        10L,
                        List.of(itemRequest)
                );

        when(supplierRepository.findByIdAndTenant_Id(10L, 1L))
                .thenReturn(Optional.of(supplier));

        when(productRepository.findByIdAndTenant_Id(20L, 1L))
                .thenReturn(Optional.of(product));

        when(purchaseOrderRepository.save(any(PurchaseOrder.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseOrderResponse response =
                purchaseOrderService.createPurchaseOrder(request, user);

        assertNotNull(response);
        assertEquals(PurchaseOrderStatus.DRAFT, response.status());
        assertEquals(
                new BigDecimal("200.00"),
                response.totalAmount()
        );
        assertEquals(1, response.items().size());
        assertEquals(20L, response.items().get(0).productId());

        verify(purchaseOrderRepository).save(any(PurchaseOrder.class));
    }

    // Test 2: Reject duplicate product IDs
    @Test
    void createPurchaseOrder_shouldRejectDuplicateProducts() {

        PurchaseOrderItemRequest firstItem =
                new PurchaseOrderItemRequest(
                        20L, 2, new BigDecimal("100.00")
                );

        PurchaseOrderItemRequest secondItem =
                new PurchaseOrderItemRequest(
                        20L, 3, new BigDecimal("100.00")
                );

        PurchaseOrderRequest request =
                new PurchaseOrderRequest(
                        10L,
                        List.of(firstItem, secondItem)
                );

        assertThrows(
                BusinessRuleException.class,
                () -> purchaseOrderService.createPurchaseOrder(request, user)
        );

        verifyNoInteractions(
                supplierRepository,
                productRepository,
                purchaseOrderRepository,
                stockMovementRepository
        );
    }

    // Test 3: Supplier does not exist in tenant
    @Test
    void createPurchaseOrder_shouldThrowWhenSupplierNotFound() {

        PurchaseOrderRequest request =
                new PurchaseOrderRequest(
                        999L,
                        List.of(
                                new PurchaseOrderItemRequest(
                                        20L, 2, new BigDecimal("100.00")
                                )
                        )
                );

        when(supplierRepository.findByIdAndTenant_Id(999L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> purchaseOrderService.createPurchaseOrder(request, user)
        );

        verifyNoInteractions(productRepository, purchaseOrderRepository);
    }

    // Test 4: Product does not exist in tenant
    @Test
    void createPurchaseOrder_shouldThrowWhenProductNotFound() {

        PurchaseOrderRequest request =
                new PurchaseOrderRequest(
                        10L,
                        List.of(
                                new PurchaseOrderItemRequest(
                                        999L, 2, new BigDecimal("100.00")
                                )
                        )
                );

        when(supplierRepository.findByIdAndTenant_Id(10L, 1L))
                .thenReturn(Optional.of(supplier));

        when(productRepository.findByIdAndTenant_Id(999L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> purchaseOrderService.createPurchaseOrder(request, user)
        );

        verify(purchaseOrderRepository, never()).save(any());
    }

    // Test 5: Receive order and update stock
    @Test
    void receivePurchaseOrder_shouldUpdateStockAndCreateMovement() {

        PurchaseOrder order = createConfirmedOrder();

        when(purchaseOrderRepository.findByIdAndTenant_Id(1L, 1L))
                .thenReturn(Optional.of(order));

        when(purchaseOrderRepository.saveAndFlush(order))
                .thenReturn(order);

        when(productRepository.saveAndFlush(product))
                .thenReturn(product);

        PurchaseOrderResponse response =
                purchaseOrderService.receivePurchaseOrder(1L, user);

        assertEquals(PurchaseOrderStatus.RECEIVED, response.status());

        verify(purchaseOrderRepository).saveAndFlush(order);
        verify(product).changeStock(5);
        verify(productRepository).saveAndFlush(product);

        ArgumentCaptor<StockMovement> captor =
                ArgumentCaptor.forClass(StockMovement.class);

        verify(stockMovementRepository).save(captor.capture());

        StockMovement movement = captor.getValue();

        assertEquals(MovementType.STOCK_IN, movement.getMovementType());
        assertEquals(5, movement.getQuantity());
        assertEquals(
                "Purchase Order received: PO-TEST-001",
                movement.getReason()
        );
    }

    // Test 6: Do not receive an already received order
    @Test
    void receivePurchaseOrder_shouldRejectAlreadyReceivedOrder() {

        PurchaseOrder order = createConfirmedOrder();
        order.setStatus(PurchaseOrderStatus.RECEIVED);

        when(purchaseOrderRepository.findByIdAndTenant_Id(1L, 1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                BusinessRuleException.class,
                () -> purchaseOrderService.receivePurchaseOrder(1L, user)
        );

        verify(purchaseOrderRepository, never()).saveAndFlush(any());
        verifyNoInteractions(productRepository, stockMovementRepository);
    }

    // Test 7: Confirm a draft order
    @Test
    void confirmPurchaseOrder_shouldChangeStatusToConfirmed() {

        PurchaseOrder order = createDraftOrder();

        when(purchaseOrderRepository.findByIdAndTenant_Id(1L, 1L))
                .thenReturn(Optional.of(order));

        when(purchaseOrderRepository.save(order))
                .thenReturn(order);

        PurchaseOrderResponse response =
                purchaseOrderService.confirmPurchaseOrder(1L, user);

        assertEquals(PurchaseOrderStatus.CONFIRMED, response.status());
        verify(purchaseOrderRepository).save(order);
    }

    // Test 8: Do not cancel a received order
    @Test
    void cancelPurchaseOrder_shouldRejectReceivedOrder() {

        PurchaseOrder order = createConfirmedOrder();
        order.setStatus(PurchaseOrderStatus.RECEIVED);

        when(purchaseOrderRepository.findByIdAndTenant_Id(1L, 1L))
                .thenReturn(Optional.of(order));

        assertThrows(
                BusinessRuleException.class,
                () -> purchaseOrderService.cancelPurchaseOrder(1L, user)
        );

        verify(purchaseOrderRepository, never()).save(any());
    }

    // Helper: create a DRAFT order
    private PurchaseOrder createDraftOrder() {
        PurchaseOrder order = new PurchaseOrder(
                "PO-TEST-001",
                supplier,
                tenant,
                user
        );

        order.addItem(
                new PurchaseOrderItem(
                        product,
                        5,
                        new BigDecimal("100.00")
                )
        );

        return order;
    }

    // Helper: create a CONFIRMED order
    private PurchaseOrder createConfirmedOrder() {
        PurchaseOrder order = createDraftOrder();
        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        return order;
    }
}
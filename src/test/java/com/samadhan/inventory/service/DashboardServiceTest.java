
package com.samadhan.inventory.service;

import com.samadhan.inventory.dto.DashboardResponse;
import com.samadhan.inventory.dto.RecentStockMovementResponse;
import com.samadhan.inventory.entity.*;
import com.samadhan.inventory.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private SalesOrderRepository salesOrderRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private User user;

    @Mock
    private Tenant tenant;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {

        when(user.getTenant()).thenReturn(tenant);
        when(tenant.getId()).thenReturn(1L);

        // Configure the default low-stock threshold
        org.springframework.test.util.ReflectionTestUtils.setField(
                dashboardService,
                "lowStockThreshold",
                5
        );
    }

    // Test 1: Get dashboard statistics successfully
    @Test
    void getDashboard_shouldReturnDashboardStatistics() {

        when(productRepository.countByTenant_Id(1L))
                .thenReturn(25L);

        when(customerRepository.countByTenant_Id(1L))
                .thenReturn(12L);

        when(supplierRepository.countByTenant_Id(1L))
                .thenReturn(8L);

        when(productRepository.calculateInventoryValue(1L))
                .thenReturn(new BigDecimal("150000.00"));

        when(productRepository.countByTenant_IdAndStockQuantityBetween(
                1L, 1, 5))
                .thenReturn(3L);

        when(productRepository.countByTenant_IdAndStockQuantity(1L, 0))
                .thenReturn(2L);

        when(salesOrderRepository.countByTenant_Id(1L))
                .thenReturn(15L);

        when(purchaseOrderRepository.countByTenant_Id(1L))
                .thenReturn(10L);

        when(salesOrderRepository.calculateTotalByStatus(
                1L, SalesOrderStatus.DISPATCHED))
                .thenReturn(new BigDecimal("85000.00"));

        when(purchaseOrderRepository.calculateTotalByStatus(
                1L, PurchaseOrderStatus.RECEIVED))
                .thenReturn(new BigDecimal("65000.00"));

        when(stockMovementRepository
                .findTop10ByTenant_IdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of());

        DashboardResponse response =
                dashboardService.getDashboard(user);

        assertNotNull(response);

        assertEquals(25L, response.totalProducts());
        assertEquals(12L, response.totalCustomers());
        assertEquals(8L, response.totalSuppliers());

        assertEquals(
                new BigDecimal("150000.00"),
                response.inventoryValue()
        );

        assertEquals(3L, response.lowStockProducts());
        assertEquals(2L, response.outOfStockProducts());

        assertEquals(15L, response.totalSalesOrders());
        assertEquals(10L, response.totalPurchaseOrders());

        assertEquals(
                new BigDecimal("85000.00"),
                response.totalSalesAmount()
        );

        assertEquals(
                new BigDecimal("65000.00"),
                response.totalPurchaseAmount()
        );

        assertTrue(response.recentStockMovements().isEmpty());
    }

    // Test 2: Use the configured low-stock threshold
    @Test
    void getDashboard_shouldUseConfiguredLowStockThreshold() {

        dashboardService.getDashboard(user);

        verify(productRepository)
                .countByTenant_IdAndStockQuantityBetween(
                        1L, 1, 5
                );
    }

    // Test 3: Use authenticated user's tenant ID
    @Test
    void getDashboard_shouldUseCurrentTenantId() {

        dashboardService.getDashboard(user);

        verify(productRepository).countByTenant_Id(1L);
        verify(customerRepository).countByTenant_Id(1L);
        verify(supplierRepository).countByTenant_Id(1L);

        verify(productRepository).calculateInventoryValue(1L);

        verify(salesOrderRepository).countByTenant_Id(1L);
        verify(purchaseOrderRepository).countByTenant_Id(1L);

        verify(stockMovementRepository)
                .findTop10ByTenant_IdOrderByCreatedAtDesc(1L);
    }

    // Test 4: Only completed orders contribute to totals
    @Test
    void getDashboard_shouldCalculateCompletedOrderAmounts() {

        when(stockMovementRepository
                .findTop10ByTenant_IdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of());

        dashboardService.getDashboard(user);

        verify(salesOrderRepository).calculateTotalByStatus(
                1L, SalesOrderStatus.DISPATCHED
        );

        verify(purchaseOrderRepository).calculateTotalByStatus(
                1L, PurchaseOrderStatus.RECEIVED
        );
    }

    // Test 5: Map recent stock movement correctly
    @Test
    void getDashboard_shouldReturnRecentStockMovementDetails() {

        Product product = mock(Product.class);
        StockMovement movement = mock(StockMovement.class);

        LocalDateTime movementDate = LocalDateTime.now();

        when(product.getId()).thenReturn(20L);
        when(product.getName()).thenReturn("Keyboard");
        when(product.getSku()).thenReturn("KEY-001");

        when(movement.getId()).thenReturn(100L);
        when(movement.getProduct()).thenReturn(product);
        when(movement.getMovementType())
                .thenReturn(MovementType.STOCK_IN);
        when(movement.getQuantity()).thenReturn(10);
        when(movement.getReason()).thenReturn("New stock received");
        when(movement.getCreatedAt()).thenReturn(movementDate);

        when(stockMovementRepository
                .findTop10ByTenant_IdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(movement));

        DashboardResponse response =
                dashboardService.getDashboard(user);

        assertEquals(1, response.recentStockMovements().size());

        RecentStockMovementResponse recentMovement =
                response.recentStockMovements().get(0);

        assertEquals(100L, recentMovement.id());
        assertEquals(20L, recentMovement.productId());
        assertEquals("Keyboard", recentMovement.productName());
        assertEquals("KEY-001", recentMovement.sku());
        assertEquals(MovementType.STOCK_IN, recentMovement.movementType());
        assertEquals(10, recentMovement.quantity());
        assertEquals("New stock received", recentMovement.reason());
        assertEquals(movementDate, recentMovement.createdAt());
    }
}

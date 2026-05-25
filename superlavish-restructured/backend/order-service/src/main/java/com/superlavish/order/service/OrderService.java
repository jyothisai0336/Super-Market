package com.superlavish.order.service;

import com.superlavish.order.dto.*;
import com.superlavish.order.model.Order;
import com.superlavish.order.model.Order.OrderStatus;
import com.superlavish.order.model.OrderItem;
import com.superlavish.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        // Calculate totals
        BigDecimal subtotal = request.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deliveryFee = subtotal.compareTo(new BigDecimal("50.00")) >= 0
                ? BigDecimal.ZERO
                : new BigDecimal("5.99");

        BigDecimal total = subtotal.add(deliveryFee).subtract(
                request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO
        );

        // Build order
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .userId(userId)
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .total(total)
                .deliveryAddress(request.getDeliveryAddress())
                .deliverySuburb(request.getDeliverySuburb())
                .deliveryPostcode(request.getDeliveryPostcode())
                .deliveryInstructions(request.getDeliveryInstructions())
                .paymentMethod(request.getPaymentMethod())
                .estimatedDelivery(Instant.now().plus(2, ChronoUnit.DAYS))
                .notes(request.getNotes())
                .build();

        // Build order items
        List<OrderItem> items = request.getItems().stream().map(i ->
                OrderItem.builder()
                        .order(order)
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productSku(i.getProductSku())
                        .imageUrl(i.getImageUrl())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .build()
        ).toList();

        order.setItems(items);
        Order saved = orderRepository.save(order);

        // Simulate async confirmation (in prod: publish to message queue)
        scheduleConfirmation(saved.getId());

        log.info("Order created: {} for user {}", saved.getOrderNumber(), userId);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toResponse(order);
    }

    public OrderResponse updateStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredAt(Instant.now());
        }

        order.setStatus(status);
        log.info("Order {} status updated to {}", order.getOrderNumber(), status);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Set<OrderStatus> cancellableStatuses = Set.of(OrderStatus.PENDING, OrderStatus.CONFIRMED);
        if (!cancellableStatuses.contains(order.getStatus())) {
            throw new RuntimeException("Cannot cancel order in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        log.info("Order {} cancelled by user {}", order.getOrderNumber(), userId);
        return toResponse(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "SL-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9000 + 1000);
    }

    private void scheduleConfirmation(UUID orderId) {
        // In production: use @Async + Kafka/RabbitMQ for event-driven status update
        new Thread(() -> {
            try {
                Thread.sleep(2000);
                updateStatus(orderId, OrderStatus.CONFIRMED);
            } catch (Exception ignored) {}
        }).start();
    }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .status(o.getStatus().name())
                .statusLabel(getStatusLabel(o.getStatus()))
                .items(o.getItems().stream().map(i -> OrderItemResponse.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productSku(i.getProductSku())
                        .imageUrl(i.getImageUrl())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build()).toList())
                .subtotal(o.getSubtotal())
                .deliveryFee(o.getDeliveryFee())
                .discount(o.getDiscount())
                .total(o.getTotal())
                .deliveryAddress(o.getDeliveryAddress())
                .deliverySuburb(o.getDeliverySuburb())
                .deliveryPostcode(o.getDeliveryPostcode())
                .estimatedDelivery(o.getEstimatedDelivery())
                .deliveredAt(o.getDeliveredAt())
                .createdAt(o.getCreatedAt())
                .build();
    }

    private String getStatusLabel(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Order Placed";
            case CONFIRMED -> "Order Confirmed";
            case PICKING -> "Being Picked";
            case PACKED -> "Packed & Ready";
            case OUT_FOR_DELIVERY -> "Out for Delivery";
            case DELIVERED -> "Delivered";
            case CANCELLED -> "Cancelled";
            case REFUNDED -> "Refunded";
        };
    }
}

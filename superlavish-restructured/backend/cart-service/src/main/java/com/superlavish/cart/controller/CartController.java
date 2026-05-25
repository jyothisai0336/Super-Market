package com.superlavish.cart.controller;

import com.superlavish.cart.model.Cart;
import com.superlavish.cart.service.CartService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // User identity injected by gateway (X-User-Id header)
    private UUID getUserId(String userIdHeader) {
        if (userIdHeader == null) throw new RuntimeException("Unauthorized");
        return UUID.fromString(userIdHeader);
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(UUID.fromString(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody AddItemRequest request) {
        Cart cart = cartService.addItem(
                UUID.fromString(userId),
                request.getProductId(),
                request.getProductName(),
                request.getProductSku(),
                request.getImageUrl(),
                request.getQuantity(),
                request.getUnitPrice()
        );
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID productId,
            @RequestBody UpdateItemRequest request) {
        return ResponseEntity.ok(
                cartService.updateItemQuantity(UUID.fromString(userId), productId, request.getQuantity())
        );
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID productId) {
        return ResponseEntity.ok(cartService.removeItem(UUID.fromString(userId), productId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestHeader("X-User-Id") String userId) {
        cartService.clearCart(UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    // DTOs
    @Data static class AddItemRequest {
        private UUID productId;
        private String productName;
        private String productSku;
        private String imageUrl;
        private int quantity;
        private BigDecimal unitPrice;
    }

    @Data static class UpdateItemRequest {
        private int quantity;
    }
}

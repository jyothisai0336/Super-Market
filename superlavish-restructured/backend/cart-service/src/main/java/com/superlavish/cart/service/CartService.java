package com.superlavish.cart.service;

import com.superlavish.cart.model.Cart;
import com.superlavish.cart.model.CartItem;
import com.superlavish.cart.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;

    // Get or create cart for user
    public Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = Cart.builder().userId(userId).build();
                    return cartRepository.save(cart);
                });
    }

    public Cart addItem(UUID userId, UUID productId, String productName,
                        String productSku, String imageUrl, int quantity, BigDecimal unitPrice) {
        Cart cart = getOrCreateCart(userId);

        // Check if item exists — update quantity
        cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresentOrElse(
                        existing -> existing.setQuantity(existing.getQuantity() + quantity),
                        () -> cart.getItems().add(CartItem.builder()
                                .cart(cart)
                                .productId(productId)
                                .productName(productName)
                                .productSku(productSku)
                                .imageUrl(imageUrl)
                                .quantity(quantity)
                                .unitPrice(unitPrice)
                                .build())
                );

        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(UUID userId, UUID productId, int quantity) {
        Cart cart = getOrCreateCart(userId);

        if (quantity <= 0) {
            cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        } else {
            cart.getItems().stream()
                    .filter(i -> i.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(i -> i.setQuantity(quantity));
        }

        return cartRepository.save(cart);
    }

    public Cart removeItem(UUID userId, UUID productId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        return cartRepository.save(cart);
    }

    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}

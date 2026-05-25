package com.superlavish.product.service;

import com.superlavish.product.dto.*;
import com.superlavish.product.model.Product;
import com.superlavish.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "products", key = "#request.cacheKey()")
    public Page<ProductResponse> searchProducts(ProductSearchRequest request) {
        Sort sort = buildSort(request.getSort());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Product> products = productRepository.searchProducts(
                request.getQ(),
                request.getCategory(),
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        );

        return products.map(this::toResponse);
    }

    @Cacheable(value = "featured-products")
    public Page<ProductResponse> getFeatured() {
        Pageable pageable = PageRequest.of(0, 12, Sort.by("rating").descending());
        return productRepository.findByIsActiveTrueAndIsFeaturedTrue(pageable).map(this::toResponse);
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponse getById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toResponse(product);
    }

    @Cacheable(value = "categories")
    public List<String> getCategories() {
        return productRepository.findAllCategories();
    }

    public Page<ProductResponse> getByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return productRepository.findByIsActiveTrueAndCategory(category, pageable).map(this::toResponse);
    }

    public Page<ProductResponse> getOnSale(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rating").descending());
        return productRepository.findByIsActiveTrueAndOnSaleTrue(pageable).map(this::toResponse);
    }

    @Transactional
    @CacheEvict(value = {"products", "featured-products"}, allEntries = true)
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .sku(request.getSku())
                .price(request.getPrice())
                .originalPrice(request.getOriginalPrice())
                .category(request.getCategory())
                .brand(request.getBrand())
                .imageUrl(request.getImageUrl())
                .stockQuantity(request.getStockQuantity())
                .unit(request.getUnit())
                .isOrganic(request.getIsOrganic())
                .isFeatured(request.getIsFeatured())
                .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = {"products", "featured-products"}, allEntries = true)
    public ProductResponse updateStock(UUID id, int quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() + quantity);
        return toResponse(productRepository.save(product));
    }

    private Sort buildSort(String sortParam) {
        return switch (sortParam == null ? "featured" : sortParam) {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "newest"     -> Sort.by("createdAt").descending();
            case "name_asc"   -> Sort.by("name").ascending();
            case "rating"     -> Sort.by("rating").descending();
            default           -> Sort.by("isFeatured").descending().and(Sort.by("rating").descending());
        };
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .sku(p.getSku())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .category(p.getCategory())
                .brand(p.getBrand())
                .imageUrl(p.getImageUrl())
                .stockQuantity(p.getStockQuantity())
                .unit(p.getUnit())
                .isActive(p.getIsActive())
                .isFeatured(p.getIsFeatured())
                .isOrganic(p.getIsOrganic())
                .onSale(p.getOnSale())
                .isNew(p.getIsNew())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .inStock(p.isInStock())
                .build();
    }
}

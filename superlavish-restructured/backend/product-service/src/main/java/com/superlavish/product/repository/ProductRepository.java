package com.superlavish.product.repository;

import com.superlavish.product.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Search by name, description, brand
    @Query("""
        SELECT p FROM Product p
        WHERE p.isActive = true
        AND (:q IS NULL OR :q = '' OR
             LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')))
        AND (:category IS NULL OR :category = '' OR p.category = :category)
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
    """)
    Page<Product> searchProducts(
            @Param("q") String q,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    // Featured products
    Page<Product> findByIsActiveTrueAndIsFeaturedTrue(Pageable pageable);

    // By category
    Page<Product> findByIsActiveTrueAndCategory(String category, Pageable pageable);

    // All distinct categories
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.isActive = true ORDER BY p.category")
    List<String> findAllCategories();

    // On sale
    Page<Product> findByIsActiveTrueAndOnSaleTrue(Pageable pageable);

    // Low stock alert (for admin)
    @Query("SELECT p FROM Product p WHERE p.stockQuantity < :threshold AND p.isActive = true")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    boolean existsBySku(String sku);
}

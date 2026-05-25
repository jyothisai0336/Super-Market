import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCartStore } from '../../context/store';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  // Skeleton loading state
  if (!product) {
    return (
      <div className="glass rounded-2xl overflow-hidden">
        <div className="skeleton h-48 w-full" />
        <div className="p-4 space-y-2">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-1/2" />
          <div className="skeleton h-8 rounded-xl w-full mt-3" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      layout
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="group glass rounded-2xl overflow-hidden card-hover cursor-pointer">
          {/* Image */}
          <div className="relative overflow-hidden bg-obsidian-900 aspect-square">
            <img
              src={product.imageUrl || `https://placehold.co/300x300/1a1a22/f59e0b?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.onSale && (
                <span className="badge bg-red-500/90 text-white font-bold">SALE</span>
              )}
              {product.isNew && (
                <span className="badge bg-gold-500/90 text-obsidian-950 font-bold">NEW</span>
              )}
              {product.isOrganic && (
                <span className="badge bg-green-500/90 text-white">ORGANIC</span>
              )}
            </div>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-obsidian-300 hover:text-red-400"
              onClick={(e) => { e.preventDefault(); toast.success('Added to wishlist!'); }}
            >
              <Heart size={14} />
            </motion.button>

            {/* Quick add - appears on hover */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="absolute bottom-3 left-3 right-3 btn-primary py-2 text-xs flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            >
              <ShoppingCart size={14} /> Add to Cart
            </motion.button>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-obsidian-400 text-xs mb-1 uppercase tracking-wider">{product.category}</p>
            <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-gold-300 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star size={12} className="fill-gold-400 text-gold-400" />
                <span className="text-xs text-obsidian-300">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-obsidian-500">({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-white">
                  ${product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-obsidian-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.unit && (
                <span className="text-xs text-obsidian-500">{product.unit}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

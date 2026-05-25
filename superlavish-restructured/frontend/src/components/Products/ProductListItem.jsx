import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../context/store';
import toast from 'react-hot-toast';

export default function ProductListItem({ product, index = 0 }) {
  const { addItem } = useCartStore();
  if (!product) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} layout>
      <Link to={`/products/${product.id}`}>
        <div className="group glass rounded-2xl p-4 flex items-center gap-5 card-hover">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-obsidian-900 flex-shrink-0">
            <img src={product.imageUrl || `https://placehold.co/96x96/1a1a22/f59e0b?text=${product.name?.[0]}`}
              alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-obsidian-400 text-xs uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="font-semibold leading-tight group-hover:text-gold-300 transition-colors">{product.name}</h3>
            {product.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="fill-gold-400 text-gold-400" />
                <span className="text-xs text-obsidian-300">{product.rating.toFixed(1)} ({product.reviewCount})</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="text-right">
              <p className="font-bold text-lg">${product.price?.toFixed(2)}</p>
              {product.originalPrice > product.price && (
                <p className="text-xs text-obsidian-500 line-through">${product.originalPrice?.toFixed(2)}</p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added!'); }}
              className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
            >
              <ShoppingCart size={14} /> Add
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

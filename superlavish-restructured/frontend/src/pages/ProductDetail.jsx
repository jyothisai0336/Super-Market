import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Star, Heart, ArrowLeft, Plus, Minus, Check, Truck, Shield } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { useCartStore } from '../context/store';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getById(id),
  });

  const product = data?.data;

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    toast.success(`${product.name} added!`);
    setTimeout(() => setAdded(false), 2000);
  };

  if (isLoading) return (
    <div className="pt-24 page-container">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 rounded w-3/4" />
          <div className="skeleton h-6 rounded w-1/2" />
          <div className="skeleton h-24 rounded" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-obsidian-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative glass rounded-3xl overflow-hidden aspect-square">
              <img src={product.imageUrl || `https://placehold.co/600x600/1a1a22/f59e0b?text=${encodeURIComponent(product.name)}`}
                alt={product.name} className="w-full h-full object-cover" />
              {product.onSale && <span className="absolute top-4 left-4 badge bg-red-500 text-white text-sm font-bold px-3 py-1">SALE</span>}
              {product.isOrganic && <span className="absolute top-4 right-4 badge bg-green-500 text-white text-sm font-bold px-3 py-1">ORGANIC</span>}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div>
              <p className="text-obsidian-400 text-sm uppercase tracking-wider mb-2">{product.category} · {product.brand}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              {product.rating && (
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-obsidian-600'} />
                  ))}
                  <span className="text-obsidian-300 text-sm">{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-gradient">${product.price?.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="text-obsidian-500 text-xl line-through">${product.originalPrice?.toFixed(2)}</span>
              )}
              {product.unit && <span className="text-obsidian-400 text-sm">{product.unit}</span>}
            </div>

            {product.description && (
              <p className="text-obsidian-300 leading-relaxed">{product.description}</p>
            )}

            {/* Perks */}
            <div className="grid grid-cols-2 gap-3">
              {[{ icon: Truck, text: 'Free delivery over $50' }, { icon: Shield, text: 'Freshness guaranteed' }].map(({ icon: Icon, text }) => (
                <div key={text} className="glass rounded-xl p-3 flex items-center gap-2 text-sm text-obsidian-300">
                  <Icon size={16} className="text-gold-400 flex-shrink-0" /> {text}
                </div>
              ))}
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4">
              <div className="flex items-center glass rounded-xl">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-12 h-12 flex items-center justify-center text-obsidian-400 hover:text-white transition-colors">
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center text-obsidian-400 hover:text-white transition-colors">
                  <Plus size={18} />
                </button>
              </div>

              <motion.button
                onClick={handleAdd}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  added ? 'bg-green-500 text-white' : 'btn-primary'
                }`}
              >
                {added ? <><Check size={20} /> Added!</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </motion.button>

              <button className="w-14 h-14 glass rounded-xl flex items-center justify-center text-obsidian-400 hover:text-red-400 transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {product.stockQuantity < 10 && product.stockQuantity > 0 && (
              <p className="text-orange-400 text-sm font-medium">⚡ Only {product.stockQuantity} left in stock</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../context/store';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const total = getTotal();

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{ background: 'rgba(13,13,18,0.98)', backdropFilter: 'blur(40px)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-gold-400" />
                <h2 className="font-display text-xl font-semibold">Your Cart</h2>
                {items.length > 0 && (
                  <span className="badge bg-gold-500/20 text-gold-400">{items.length} items</span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="w-8 h-8 glass rounded-full flex items-center justify-center text-obsidian-400 hover:text-white"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <div className="text-6xl">🛒</div>
                  <h3 className="font-display text-xl font-semibold">Your cart is empty</h3>
                  <p className="text-obsidian-400 text-center text-sm">Discover our premium selection and add items to your cart</p>
                  <button onClick={() => { closeCart(); navigate('/products'); }} className="btn-primary">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="px-6 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 glass rounded-2xl p-4"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-obsidian-900 flex-shrink-0">
                          <img
                            src={item.image || `https://placehold.co/64x64/1a1a22/f59e0b?text=${item.name?.[0]}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm leading-tight mb-1 truncate">{item.name}</h4>
                          <p className="text-gold-400 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>

                          {/* Quantity */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center glass rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-obsidian-400 hover:text-white transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-obsidian-400 hover:text-white transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.productId)}
                              className="w-7 h-7 flex items-center justify-center text-obsidian-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-obsidian-300">
                    <span>Subtotal</span><span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-obsidian-300">
                    <span>Delivery</span>
                    <span className={total >= 50 ? 'text-green-400 font-medium' : ''}>
                      {total >= 50 ? 'FREE' : '$5.99'}
                    </span>
                  </div>
                  {total < 50 && (
                    <div className="text-xs text-obsidian-500">
                      Add ${(50 - total).toFixed(2)} more for free delivery
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-gold-400">${(total + (total >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleCheckout}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </motion.button>

                <button onClick={() => { closeCart(); navigate('/products'); }} className="w-full text-center text-sm text-obsidian-400 hover:text-white transition-colors">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

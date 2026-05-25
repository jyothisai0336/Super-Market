import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { ordersAPI } from '../utils/api';
import { useAuthStore } from '../context/store';

const STATUS_CONFIG = {
  PENDING:           { icon: Clock,        color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  label: 'Order Placed' },
  CONFIRMED:         { icon: CheckCircle,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    label: 'Confirmed' },
  PICKING:           { icon: Package,      color: 'text-purple-400',  bg: 'bg-purple-400/10',  label: 'Being Picked' },
  PACKED:            { icon: Package,      color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  label: 'Packed' },
  OUT_FOR_DELIVERY:  { icon: Truck,        color: 'text-gold-400',    bg: 'bg-gold-400/10',    label: 'Out for Delivery' },
  DELIVERED:         { icon: CheckCircle,  color: 'text-green-400',   bg: 'bg-green-400/10',   label: 'Delivered' },
  CANCELLED:         { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-400/10',     label: 'Cancelled' },
};

export default function Orders() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersAPI.getAll,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="pt-32 text-center page-container">
        <p className="text-6xl mb-4">🔒</p>
        <h2 className="font-display text-2xl font-bold mb-3">Sign in to view orders</h2>
        <Link to="/login" className="btn-primary inline-block">Sign In</Link>
      </div>
    );
  }

  const orders = data?.data?.content || [];

  return (
    <div className="pt-24 pb-16">
      <div className="page-container max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold">My Orders</h1>
          <p className="text-obsidian-400 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-6 space-y-3">
                <div className="skeleton h-5 rounded w-1/3" />
                <div className="skeleton h-4 rounded w-2/3" />
                <div className="skeleton h-8 rounded-xl w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📦</p>
            <h3 className="font-display text-2xl font-bold mb-2">No orders yet</h3>
            <p className="text-obsidian-400 mb-6">Your orders will appear here</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const Icon = status.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={`/orders/${order.id}`} className="block glass rounded-2xl p-6 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm text-obsidian-400 mb-1">{order.orderNumber}</p>
                        <p className="font-bold text-lg mb-3">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                          <Icon size={14} /> {status.label}
                        </div>
                      </div>
                      <div className="text-right flex items-start gap-3">
                        <div>
                          <p className="font-bold text-xl text-gold-400">${order.total?.toFixed(2)}</p>
                          <p className="text-obsidian-500 text-xs mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-obsidian-500 mt-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

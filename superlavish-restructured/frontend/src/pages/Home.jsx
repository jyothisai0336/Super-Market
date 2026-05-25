import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Truck, Shield, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/Products/ProductCard';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25,0.46,0.45,0.94] } } };

const categories = [
  { name: 'Fresh Produce', icon: '🥦', color: 'from-green-900/40 to-green-800/20', border: 'border-green-500/20' },
  { name: 'Dairy & Eggs', icon: '🥛', color: 'from-blue-900/40 to-blue-800/20', border: 'border-blue-500/20' },
  { name: 'Meat & Seafood', icon: '🥩', color: 'from-red-900/40 to-red-800/20', border: 'border-red-500/20' },
  { name: 'Bakery', icon: '🍞', color: 'from-amber-900/40 to-amber-800/20', border: 'border-amber-500/20' },
  { name: 'Pantry', icon: '🫙', color: 'from-purple-900/40 to-purple-800/20', border: 'border-purple-500/20' },
  { name: 'Beverages', icon: '🧃', color: 'from-cyan-900/40 to-cyan-800/20', border: 'border-cyan-500/20' },
  { name: 'Frozen', icon: '❄️', color: 'from-indigo-900/40 to-indigo-800/20', border: 'border-indigo-500/20' },
  { name: 'Health & Beauty', icon: '✨', color: 'from-pink-900/40 to-pink-800/20', border: 'border-pink-500/20' },
];

const perks = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50', color: 'text-gold-400' },
  { icon: Clock, title: 'Same Day', desc: 'Order before 2pm', color: 'text-green-400' },
  { icon: Shield, title: 'Quality Guaranteed', desc: 'Fresh or your money back', color: 'text-blue-400' },
  { icon: Sparkles, title: 'Premium Selection', desc: '10,000+ products', color: 'text-purple-400' },
];

export default function Home() {
  const navigate = useNavigate();
  const { data: featured } = useQuery({ queryKey: ['featured'], queryFn: productsAPI.getFeatured });

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-obsidian-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.15),transparent)]" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative page-container py-32 lg:py-48">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl"
          >
            <motion.div variants={item} className="flex items-center gap-2 mb-6">
              <div className="glass-gold px-3 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles size={14} className="text-gold-400" />
                <span className="text-gold-400 text-xs font-medium tracking-wider uppercase">Premium Grocery Experience</span>
              </div>
            </motion.div>

            <motion.h1 variants={item} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
              Fresh. Fast.
              <br />
              <span className="text-gradient">Lavishly</span>
              <br />
              Delivered.
            </motion.h1>

            <motion.p variants={item} className="text-obsidian-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              Shop from 10,000+ premium products. From farm-fresh produce to artisan bakery goods — experience grocery shopping reimagined with silky-smooth delivery to your door.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => navigate('/products')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary flex items-center gap-2 text-base"
              >
                Shop Now <ArrowRight size={18} />
              </motion.button>
              <motion.button
                onClick={() => navigate('/products?offers=true')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-ghost flex items-center gap-2 text-base"
              >
                View Offers
              </motion.button>
            </motion.div>

            <motion.div variants={item} className="mt-16 flex items-center gap-8 text-sm text-obsidian-400">
              <div><span className="text-white font-semibold text-2xl">50K+</span><br />Happy Customers</div>
              <div className="w-px h-10 bg-white/10" />
              <div><span className="text-white font-semibold text-2xl">10K+</span><br />Products Available</div>
              <div className="w-px h-10 bg-white/10" />
              <div><span className="text-white font-semibold text-2xl">99%</span><br />Satisfaction Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Perks Bar */}
      <section className="py-8 border-y border-white/5">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-4 glass rounded-2xl"
              >
                <perk.icon size={24} className={perk.color} />
                <div>
                  <p className="font-semibold text-sm">{perk.title}</p>
                  <p className="text-obsidian-400 text-xs">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-gold-400 text-sm font-medium tracking-wider uppercase mb-2">Browse</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Shop by Category</h2>
            </div>
            <Link to="/products" className="text-gold-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              All categories <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className={`cursor-pointer bg-gradient-to-br ${cat.color} border ${cat.border} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center text-obsidian-200 leading-tight">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-transparent via-obsidian-900/30 to-transparent">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-gold-400 text-sm font-medium tracking-wider uppercase mb-2">Handpicked</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Featured Products</h2>
            </div>
            <Link to="/products" className="text-gold-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(featured?.data || Array(8).fill(null)).map((product, i) => (
              <ProductCard key={product?.id || i} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden glass rounded-3xl p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Your First Order — <span className="text-gradient">20% Off</span>
              </h2>
              <p className="text-obsidian-300 mb-8 text-lg max-w-xl mx-auto">
                Sign up today and enjoy 20% off your first order. No minimum spend required.
              </p>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary text-base"
                >
                  Create Free Account
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {[
              { title: 'Shop', links: ['Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery'] },
              { title: 'Account', links: ['Sign In', 'Register', 'My Orders', 'Profile'] },
              { title: 'Help', links: ['Delivery Info', 'Returns', 'FAQ', 'Contact Us'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy', 'Terms'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-obsidian-400 mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-sm text-obsidian-300 hover:text-white transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
                <span className="text-obsidian-950 font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-gradient">SuperLavish</span>
            </div>
            <p className="text-obsidian-400 text-sm">© 2024 SuperLavish. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

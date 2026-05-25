import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List } from 'lucide-react';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import ProductListItem from '../components/Products/ProductListItem';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'name_asc', label: 'Name: A-Z' },
];

const PRICE_RANGES = [
  { label: 'Under $5', min: 0, max: 5 },
  { label: '$5 – $10', min: 5, max: 10 },
  { label: '$10 – $25', min: 10, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: 'Over $50', min: 50, max: 9999 },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const q = searchParams.get('q') || '';

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', q, selectedCategory, sort, priceRange],
    queryFn: () => productsAPI.getAll({
      q, category: selectedCategory, sort,
      minPrice: priceRange?.min, maxPrice: priceRange?.max,
    }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productsAPI.getCategories,
  });

  const products = productsData?.data?.content || [];
  const totalElements = productsData?.data?.totalElements || 0;
  const categories = categoriesData?.data || [];

  return (
    <div className="pt-24 pb-16">
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">
              {selectedCategory || (q ? `"${q}"` : 'All Products')}
            </h1>
            <p className="text-obsidian-400 text-sm mt-1">{totalElements} products found</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="glass rounded-xl flex p-1">
              <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-obsidian-400'}`}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-gold-500/20 text-gold-400' : 'text-obsidian-400'}`}>
                <List size={16} />
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="glass text-sm px-4 py-2 rounded-xl appearance-none pr-8 cursor-pointer focus:outline-none focus:border-gold-500/40"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-obsidian-900">{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-obsidian-400 pointer-events-none" />
            </div>

            {/* Filter toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${filtersOpen ? 'glass-gold text-gold-400' : 'glass text-obsidian-300 hover:text-white'}`}
            >
              <SlidersHorizontal size={16} /> Filters
            </motion.button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden flex-shrink-0"
              >
                <div className="w-64 glass rounded-2xl p-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-obsidian-400 mb-3">Category</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-gold-500/20 text-gold-400' : 'text-obsidian-300 hover:text-white hover:bg-white/5'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-gold-500/20 text-gold-400' : 'text-obsidian-300 hover:text-white hover:bg-white/5'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-obsidian-400 mb-3">Price Range</h3>
                    <div className="space-y-1">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => setPriceRange(priceRange?.label === range.label ? null : range)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceRange?.label === range.label ? 'bg-gold-500/20 text-gold-400' : 'text-obsidian-300 hover:text-white hover:bg-white/5'}`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear filters */}
                  {(selectedCategory || priceRange) && (
                    <button
                      onClick={() => { setSelectedCategory(''); setPriceRange(null); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
                    >
                      <X size={14} /> Clear Filters
                    </button>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`grid ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4 md:gap-6`}>
                {Array(12).fill(null).map((_, i) => (
                  <div key={i} className="glass rounded-2xl overflow-hidden">
                    <div className="skeleton h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-4 rounded w-1/2" />
                      <div className="skeleton h-8 rounded w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-6xl mb-4">🛒</p>
                <h3 className="font-display text-2xl font-bold mb-2">No products found</h3>
                <p className="text-obsidian-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <motion.div
                layout
                className={`grid ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-4 md:gap-6`}
              >
                <AnimatePresence>
                  {products.map((product, i) => (
                    view === 'grid'
                      ? <ProductCard key={product.id} product={product} index={i} />
                      : <ProductListItem key={product.id} product={product} index={i} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

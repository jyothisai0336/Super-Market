import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, User, Menu, X, LogOut, Package, Heart } from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '../../context/store';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCount, toggleCart } = useCartStore();
  const { setSearchQuery } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    navigate(`/products?q=${encodeURIComponent(searchInput)}`);
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Shop', path: '/products' },
    { label: 'Offers', path: '/products?offers=true' },
    { label: 'Orders', path: '/orders' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="page-container flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center shadow-gold"
            >
              <span className="text-obsidian-950 font-bold text-lg">S</span>
            </motion.div>
            <div>
              <span className="font-display font-bold text-xl text-gradient">SuperLavish</span>
              <div className="text-xs text-obsidian-400 -mt-1 tracking-wider">PREMIUM GROCERY</div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-300 relative group ${
                  location.pathname === link.path ? 'text-gold-400' : 'text-obsidian-300 hover:text-white'
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300 ${
                  location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-obsidian-300 hover:text-gold-400 transition-colors"
            >
              <Search size={18} />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleCart}
              className="w-10 h-10 glass rounded-xl flex items-center justify-center text-obsidian-300 hover:text-gold-400 transition-colors relative"
            >
              <ShoppingCart size={18} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gold-500 text-obsidian-950 text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 glass-gold rounded-xl flex items-center justify-center text-gold-400"
                >
                  <span className="font-semibold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                </motion.button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-12 w-52 glass rounded-2xl p-2 shadow-glass"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-obsidian-400 truncate">{user?.email}</p>
                      </div>
                      {[
                        { icon: User, label: 'Profile', to: '/profile' },
                        { icon: Package, label: 'My Orders', to: '/orders' },
                        { icon: Heart, label: 'Wishlist', to: '/wishlist' },
                      ].map(({ icon: Icon, label, to }) => (
                        <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-obsidian-300 hover:text-white hover:bg-white/5 transition-colors">
                          <Icon size={16} /> {label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-1 border-t border-white/10 pt-2"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-sm hidden sm:flex items-center gap-2"
                >
                  <User size={16} /> Sign In
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-10 h-10 glass rounded-xl flex items-center justify-center"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="page-container py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" size={18} />
                  <input
                    autoFocus
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for products, brands, categories..."
                    className="input-field pl-12 pr-4"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-white/5"
            >
              <div className="page-container py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className="px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-medium transition-colors">
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link to="/login" className="btn-primary text-center mt-2">Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Backdrop for menus */}
      {(userMenuOpen || searchOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setUserMenuOpen(false); setSearchOpen(false); }} />
      )}
    </>
  );
}

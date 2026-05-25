import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../context/store';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Welcome to SuperLavish! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05),transparent_60%)]" />
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold-500 flex items-center justify-center shadow-gold">
              <span className="text-obsidian-950 font-bold text-2xl font-display">S</span>
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-center mb-2">Create account</h1>
          <p className="text-obsidian-400 text-center text-sm mb-8">Join SuperLavish and get 20% off your first order</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { icon: User, key: 'name', type: 'text', placeholder: 'Full name' },
              { icon: Mail, key: 'email', type: 'email', placeholder: 'Email address' },
              { icon: Phone, key: 'phone', type: 'tel', placeholder: 'Phone (optional)' },
            ].map(({ icon: Icon, key, type, placeholder }) => (
              <div key={key} className="relative">
                <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" />
                <input type={type} value={form[key]} onChange={set(key)} placeholder={placeholder}
                  required={key !== 'phone'} className="input-field pl-11" />
              </div>
            ))}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" />
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                placeholder="Password (min 6 chars)" required minLength={6} className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-obsidian-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-400" />
              <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Confirm password"
                required className="input-field pl-11" />
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-obsidian-900/30 border-t-obsidian-900 rounded-full animate-spin" /> : <> Create Account <ArrowRight size={18} /> </>}
            </motion.button>
          </form>
          <p className="text-center text-sm text-obsidian-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

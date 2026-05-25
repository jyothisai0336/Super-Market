import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, ChevronRight, Lock } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { ordersAPI } from '../utils/api';
import { useCartStore } from '../context/store';
import toast from 'react-hot-toast';

const steps = ['Delivery', 'Payment', 'Review'];

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ street: '', suburb: '', state: '', postcode: '', instructions: '' });
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '', name: '' });
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = getTotal();
  const delivery = total >= 50 ? 0 : 5.99;

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: () => ordersAPI.create({
      items: items.map(i => ({
        productId: i.productId, productName: i.name, imageUrl: i.image,
        quantity: i.quantity, unitPrice: i.price,
      })),
      deliveryAddress: address.street,
      deliverySuburb: address.suburb,
      deliveryPostcode: address.postcode,
      deliveryInstructions: address.instructions,
      paymentMethod: payment.method,
    }),
    onSuccess: (res) => {
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${res.data.id}`);
    },
    onError: () => toast.error('Failed to place order'),
  });

  const fieldCls = "input-field";

  return (
    <div className="pt-24 pb-16">
      <div className="page-container max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                i === step ? 'bg-gold-500 text-obsidian-950' :
                i < step ? 'glass text-green-400' : 'glass text-obsidian-500'
              }`}>
                <span>{i < step ? '✓' : i + 1}</span> {s}
              </div>
              {i < steps.length - 1 && <ChevronRight size={16} className="text-obsidian-600" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-gold-400" />
                  <h2 className="font-semibold text-lg">Delivery Address</h2>
                </div>
                <input className={fieldCls} placeholder="Street address" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className={fieldCls} placeholder="Suburb" value={address.suburb} onChange={e => setAddress({...address, suburb: e.target.value})} />
                  <input className={fieldCls} placeholder="Postcode" value={address.postcode} onChange={e => setAddress({...address, postcode: e.target.value})} />
                </div>
                <input className={fieldCls} placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                <textarea className={`${fieldCls} resize-none`} rows={3} placeholder="Delivery instructions (optional)" value={address.instructions} onChange={e => setAddress({...address, instructions: e.target.value})} />
                <button onClick={() => setStep(1)} disabled={!address.street || !address.suburb} className="btn-primary w-full mt-2 disabled:opacity-50">Continue to Payment</button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={20} className="text-gold-400" />
                  <h2 className="font-semibold text-lg">Payment</h2>
                </div>
                <div className="flex gap-3">
                  {['card', 'paypal'].map(m => (
                    <button key={m} onClick={() => setPayment({...payment, method: m})}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all capitalize ${payment.method === m ? 'glass-gold text-gold-400 border-gold-500/40' : 'glass text-obsidian-400'}`}>
                      {m === 'card' ? '💳 Credit Card' : '🅿️ PayPal'}
                    </button>
                  ))}
                </div>
                {payment.method === 'card' && (
                  <>
                    <input className={fieldCls} placeholder="Card number" maxLength={19}
                      value={payment.cardNumber}
                      onChange={e => setPayment({...payment, cardNumber: e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim()})} />
                    <input className={fieldCls} placeholder="Name on card" value={payment.name} onChange={e => setPayment({...payment, name: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <input className={fieldCls} placeholder="MM/YY" maxLength={5} value={payment.expiry} onChange={e => setPayment({...payment, expiry: e.target.value})} />
                      <input className={fieldCls} placeholder="CVV" maxLength={4} type="password" value={payment.cvv} onChange={e => setPayment({...payment, cvv: e.target.value})} />
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1">Review Order</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6 space-y-4">
                <h2 className="font-semibold text-lg mb-4">Review Your Order</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-12 h-12 glass rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-obsidian-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-obsidian-300"><span>Delivering to</span><span className="text-right text-xs max-w-[200px]">{address.street}, {address.suburb} {address.postcode}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                  <motion.button
                    onClick={placeOrder}
                    disabled={isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock size={16} /> {isPending ? 'Placing...' : 'Place Order'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order summary */}
          <div className="glass rounded-3xl p-6 h-fit space-y-4 sticky top-24">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm text-obsidian-300">
              <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className={delivery === 0 ? 'text-green-400 font-medium' : ''}>{delivery === 0 ? 'FREE' : `$${delivery.toFixed(2)}`}</span></div>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-gold-400">${(total + delivery).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-obsidian-500 pt-2">
              <Lock size={12} /> Payments are encrypted and secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

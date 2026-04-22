import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [address, setAddress] = useState({ name: profile?.full_name || '', phone: profile?.phone || '', line1: '', city: 'Faridabad', pincode: '121001' });
  const [payMethod, setPayMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const deliveryFee = totalPrice >= 199 ? 0 : 25;
  const grandTotal = totalPrice + deliveryFee;

  async function placeOrder() {
    if (!address.name || !address.line1) { toast.error('Please fill delivery address'); return; }
    setLoading(true);
    
    const isMock = user?.id?.startsWith('00000000');

    if (isMock) {
      // Handle Mock Order
      const mockOrder = {
        id: `mock-${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        total_amount: grandTotal,
        delivery_fee: deliveryFee,
        status: 'pending',
        payment_method: payMethod,
        payment_status: payMethod === 'cod' ? 'pending' : 'paid',
        delivery_address: address,
        created_at: new Date().toISOString(),
        order_items: cartItems.map(i => ({
          id: `mi-${Math.random().toString(36).substr(2, 9)}`,
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.products.price,
          products: { name: i.products.name }
        }))
      };

      const savedOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`) || '[]');
      localStorage.setItem(`orders_${user.id}`, JSON.stringify([mockOrder, ...savedOrders]));
      
      await clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
      setLoading(false);
      return;
    }

    try {
      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user.id,
        total_amount: grandTotal,
        delivery_fee: deliveryFee,
        status: 'pending',
        payment_method: payMethod,
        payment_status: payMethod === 'cod' ? 'pending' : 'paid',
        delivery_address: address,
      }).select().single();

      if (error) throw error;

      const items = cartItems.map(i => ({ order_id: order.id, product_id: i.product_id, quantity: i.quantity, unit_price: i.products.price }));
      await supabase.from('order_items').insert(items);
      await clearCart();

      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div className="page fade-in" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <div className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20 }}>Checkout</h1>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Delivery Address */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            📍 Delivery Address
          </h3>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" value={address.name} onChange={e => setAddress(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input className="input-field" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" />
          </div>
          <div className="input-group">
            <label className="input-label">Address</label>
            <input className="input-field" value={address.line1} onChange={e => setAddress(p => ({ ...p, line1: e.target.value }))} placeholder="House no, Street, Area" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">City</label>
              <input className="input-field" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Pincode</label>
              <input className="input-field" value={address.pincode} onChange={e => setAddress(p => ({ ...p, pincode: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 15, marginBottom: 14 }}>💳 Payment Method</h3>
          {[
            { id: 'cod', label: 'Cash on Delivery', icon: '💵', sub: 'Pay when delivered' },
            { id: 'upi', label: 'UPI / GPay', icon: '📱', sub: 'PhonePe, GPay, Paytm' },
          ].map(m => (
            <div key={m.id} onClick={() => setPayMethod(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12, border: `1.5px solid ${payMethod === m.id ? 'var(--primary)' : 'var(--outline-variant)'}`, marginBottom: 10, cursor: 'pointer', background: payMethod === m.id ? 'rgba(0,110,36,0.05)' : 'transparent', transition: 'all 0.15s' }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--outline)' }}>{m.sub}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${payMethod === m.id ? 'var(--primary)' : 'var(--outline)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {payMethod === m.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="bill-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Bill Summary</h3>
          {cartItems.map(i => (
            <div key={i.id} className="bill-row" style={{ fontSize: 13 }}>
              <span>{i.products?.name} × {i.quantity}</span>
              <span>₹{(i.products?.price * i.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="bill-row"><span>Delivery</span><span>{deliveryFee === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${deliveryFee}`}</span></div>
          <div className="bill-row total"><span>Total</span><span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(0)}</span></div>
        </div>

        <button className="btn-primary" onClick={placeOrder} disabled={loading}>
          {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toFixed(0)}`}
        </button>
      </div>
    </div>
  );
}

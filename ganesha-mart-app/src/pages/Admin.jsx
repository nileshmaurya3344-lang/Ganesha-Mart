import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/');
      toast.error('Unauthorized access');
      return;
    }
    if (isAdmin) fetchOrders();
  }, [user, isAdmin]);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name, phone)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateOrderStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) toast.error('Failed to update status');
    else {
      toast.success(`Order marked as ${status}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  }

  if (!isAdmin) return null;

  return (
    <div className="page fade-in" style={{ background: 'var(--surface)' }}>
      <div className="top-header" style={{ background: 'var(--tertiary)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontSize: 20 }}>Admin Dashboard</h1>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Orders ({orders.length})</h2>

        {loading ? (
          <div className="loader"><div className="spinner" style={{ borderTopColor: 'var(--tertiary)' }} /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="emoji">📝</span>
            <h3>No orders found</h3>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ background: 'var(--surface-lowest)', borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Order #{order.id.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: 'var(--outline)' }}>{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>₹{order.total_amount}</div>
                  <div style={{ fontSize: 11, background: 'var(--surface-container)', padding: '2px 8px', borderRadius: 999, display: 'inline-block', marginTop: 4 }}>{order.payment_method.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-low)', padding: 12, borderRadius: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{order.delivery_address?.name} ({order.delivery_address?.phone})</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{order.delivery_address?.line1}, {order.delivery_address?.city} - {order.delivery_address?.pincode}</div>
              </div>

              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateOrderStatus(order.id, s)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: `1px solid ${order.status === s ? 'var(--tertiary)' : 'var(--outline-variant)'}`,
                      background: order.status === s ? 'var(--tertiary)' : 'transparent',
                      color: order.status === s ? 'white' : 'var(--outline)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s.replace(/_/g, ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

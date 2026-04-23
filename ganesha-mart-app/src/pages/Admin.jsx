import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, profile } = useAuth();

  useEffect(() => {
    // Strict admin check
    if (user && !isAdmin) {
      navigate('/');
      toast.error('Access Denied: Admin privileges required');
      return;
    }
  }, [user, isAdmin, navigate]);

  const adminActions = [
    { id: 'toggle', label: 'ON/OFF', icon: '⚡', color: '#FF3B30' },
    { id: 'morning', label: 'Morning delivery', icon: '☀️', color: '#FF9500' },
    { id: 'orders', label: 'Order received', icon: '🛍️', color: '#34C759' },
    { id: 'inventory', label: 'Inventry', icon: '📦', color: '#5856D6' },
    { id: 'products', label: 'Product listing', icon: '📝', color: '#007AFF' },
    { id: 'users', label: 'users mamangement', icon: '👥', color: '#AF52DE' },
  ];

  if (!isAdmin) return null;

  return (
    <div className="page fade-in" style={{ 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      paddingBottom: 80 
    }}>
      {/* Premium Header */}
      <div style={{ 
        padding: '30px 20px', 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Admin Panel</h1>
          <div style={{ 
            background: 'var(--primary-container)', 
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Super Admin
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Welcome back, {profile?.full_name || 'Admin'}</p>
      </div>

      <div style={{ padding: 20 }}>
        {/* Quick Stats or Status */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: 20, 
          marginBottom: 24,
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Today's Orders</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>24</div>
          </div>
          <div style={{ width: 1, background: '#eee' }} />
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#34C759' }}>₹12.4k</div>
          </div>
          <div style={{ width: 1, background: '#eee' }} />
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Active Now</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FF9500' }}>8</div>
          </div>
        </div>

        {/* 6 Square Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 16 
        }}>
          {adminActions.map(action => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === 'toggle' || action.id === 'morning') navigate('/admin/store-status');
                else if (action.id === 'orders') navigate('/admin/orders');
                else toast.success(`Opening ${action.label}...`);
              }}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: 24,
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                padding: 16,
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
            >
              {/* Subtle background glow */}
              <div style={{
                position: 'absolute',
                width: '60%',
                height: '60%',
                background: action.color,
                filter: 'blur(40px)',
                opacity: 0.05,
                zIndex: 0
              }} />

              <div style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: `${action.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                zIndex: 1
              }}>
                {action.icon}
              </div>
              <span style={{ 
                fontSize: 14, 
                fontWeight: 700, 
                color: '#1a1a1a',
                textAlign: 'center',
                zIndex: 1,
                lineHeight: 1.2
              }}>
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Option */}
        <button 
          onClick={() => navigate('/profile')}
          style={{
            marginTop: 30,
            width: '100%',
            padding: '16px',
            borderRadius: 20,
            background: 'white',
            border: '1px solid #eee',
            color: '#666',
            fontWeight: 600,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Go to User Profile
        </button>
      </div>
    </div>
  );
}

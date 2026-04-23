import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AdminStoreStatus() {
  const navigate = useNavigate();
  const { 
    isOpen, 
    deliveryRadius, 
    morningDeliveryEnabled, 
    morningCutoff, 
    minOrderValue, 
    deliveryCharge,
    handlingCharge,
    openingTime,
    closingTime,
    isAutoScheduleEnabled,
    isCurrentlyOpen,
    updateSettings, 
    loading 
  } = useStore();
  const { isAdmin } = useAuth();

  // Local state for smooth UI interaction before saving
  const [localRadius, setLocalRadius] = useState(deliveryRadius);
  const [localCutoff, setLocalCutoff] = useState(morningCutoff);
  const [localMinOrder, setLocalMinOrder] = useState(minOrderValue);
  const [localDelivery, setLocalDelivery] = useState(deliveryCharge);
  const [localHandling, setLocalHandling] = useState(handlingCharge);
  const [localOpening, setLocalOpening] = useState(openingTime);
  const [localClosing, setLocalClosing] = useState(closingTime);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('Unauthorized');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    setLocalRadius(deliveryRadius);
    setLocalCutoff(morningCutoff);
    setLocalMinOrder(minOrderValue);
    setLocalDelivery(deliveryCharge);
    setLocalHandling(handlingCharge);
    setLocalOpening(openingTime);
    setLocalClosing(closingTime);
  }, [deliveryRadius, morningCutoff, minOrderValue, deliveryCharge, handlingCharge, openingTime, closingTime]);

  if (!isAdmin || loading) return null;

  const saveSetting = async (key, value) => {
    try {
      await updateSettings({ [key]: value });
      toast.success('Updated successfully');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="page fade-in" style={{ 
      background: '#fcfcfd',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 40
    }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '16px', 
        borderBottom: '1px solid #f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <button onClick={() => navigate('/admin')} style={{ background: '#f5f5f7', border: 'none', borderRadius: 12, padding: 8, cursor: 'pointer' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Store & Logistics</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>
        
        {/* Store Status Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          padding: 24, 
          marginBottom: 20, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: isCurrentlyOpen ? '#34C75915' : '#FF3B3015',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40
            }}>
              {isCurrentlyOpen ? '🏪' : '🔒'}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>
              Store is {isCurrentlyOpen ? 'OPEN' : 'CLOSED'}
            </h2>
            <p style={{ color: '#666', fontSize: 13 }}>
              {isCurrentlyOpen ? 'Customers can place orders now.' : 'Store is currently not accepting orders.'}
            </p>
          </div>

          {/* Master Control */}
          <div style={{ background: '#f8f9fa', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Master Status</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>Manual override to force close</p>
              </div>
              <div 
                onClick={() => saveSetting('isOpen', !isOpen)}
                style={{
                  width: 52,
                  height: 32,
                  borderRadius: 16,
                  background: isOpen ? '#34C759' : '#e0e0e0',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: 'white',
                  position: 'absolute',
                  top: 3,
                  left: isOpen ? 23 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>
          </div>

          {/* Auto Schedule Section */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Auto Schedule</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>Follow opening/closing times</p>
              </div>
              <div 
                onClick={() => saveSetting('isAutoScheduleEnabled', !isAutoScheduleEnabled)}
                style={{
                  width: 52,
                  height: 32,
                  borderRadius: 16,
                  background: isAutoScheduleEnabled ? 'var(--primary)' : '#e0e0e0',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: 'white',
                  position: 'absolute',
                  top: 3,
                  left: isAutoScheduleEnabled ? 23 : 3,
                  transition: 'left 0.2s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }} />
              </div>
            </div>

            {isAutoScheduleEnabled && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 }}>Opening Time</label>
                  <input 
                    type="time" 
                    value={localOpening}
                    onChange={(e) => setLocalOpening(e.target.value)}
                    onBlur={() => saveSetting('openingTime', localOpening)}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 14, background: '#fcfcfd' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 600 }}>Closing Time</label>
                  <input 
                    type="time" 
                    value={localClosing}
                    onChange={(e) => setLocalClosing(e.target.value)}
                    onBlur={() => saveSetting('closingTime', localClosing)}
                    style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 14, background: '#fcfcfd' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Radius */}
        <div className="settings-card" style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Delivery Radius</h3>
            <span style={{ background: 'var(--primary-container)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              {localRadius} km
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            step="0.5"
            value={localRadius}
            onChange={(e) => setLocalRadius(parseFloat(e.target.value))}
            onMouseUp={() => saveSetting('deliveryRadius', localRadius)}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999', marginTop: 8 }}>
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>

        {/* Morning Delivery */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Morning Delivery</h3>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#666' }}>Enable 7 AM milk & bread delivery</p>
            </div>
            <div 
              onClick={() => saveSetting('morningDeliveryEnabled', !morningDeliveryEnabled)}
              style={{
                width: 52,
                height: 32,
                borderRadius: 16,
                background: morningDeliveryEnabled ? '#34C759' : '#e0e0e0',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: 'white',
                position: 'absolute',
                top: 3,
                left: morningDeliveryEnabled ? 23 : 3,
                transition: 'left 0.3s',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }} />
            </div>
          </div>

          {morningDeliveryEnabled && (
            <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600 }}>Order Cutoff Time</h4>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="time" 
                  value={localCutoff}
                  onChange={(e) => setLocalCutoff(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid #eee',
                    fontSize: 15,
                    fontFamily: 'inherit'
                  }}
                />
                <button 
                  onClick={() => saveSetting('morningCutoff', localCutoff)}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Thresholds */}
        <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Pricing & Thresholds</h3>
          
          {/* Min Order */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 8 }}>Minimum Order Value (₹)</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="number" 
                value={localMinOrder}
                onChange={(e) => setLocalMinOrder(e.target.value)}
                placeholder="e.g. 99"
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
              />
              <button onClick={() => saveSetting('minOrderValue', parseFloat(localMinOrder))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
            </div>
          </div>

          {/* Handling Charge */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 8 }}>Handling Charge (₹)</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="number" 
                value={localHandling}
                onChange={(e) => setLocalHandling(e.target.value)}
                placeholder="e.g. 5"
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
              />
              <button onClick={() => saveSetting('handlingCharge', parseFloat(localHandling))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
            </div>
          </div>

          {/* Delivery Charge */}
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#666', marginBottom: 8 }}>Standard Delivery Charge (₹)</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="number" 
                value={localDelivery}
                onChange={(e) => setLocalDelivery(e.target.value)}
                placeholder="e.g. 25"
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 15 }}
              />
              <button onClick={() => saveSetting('deliveryCharge', parseFloat(localDelivery))} className="btn-primary" style={{ width: 'auto', padding: '0 20px', borderRadius: 12 }}>Save</button>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24 }}>
          All changes are applied instantly in real-time.
        </p>

      </div>
    </div>
  );
}

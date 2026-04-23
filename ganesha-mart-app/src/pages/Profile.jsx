import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.full_name || '');
  }, [profile]);

  if (!user) return (
    <div className="page">
      <div className="top-header"><h1 style={{ fontSize: 20 }}>Profile</h1></div>
      <div className="empty-state">
        <h3>Please login</h3>
        <p>Login to view your profile and settings</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Login Now</button>
      </div>
    </div>
  );

  async function handleSave() {
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSaving(true);
    const { error } = await updateProfile({ full_name: name });
    setSaving(false);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
    }
  }

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-low)' }}>
      <div className="top-header">
        <h1 style={{ fontSize: 20 }}>Account</h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        {/* User Info Card */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 20, padding: 20, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 700 }}>
            {name ? name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{name || 'Ganesha Mart User'}</h2>
            <div style={{ fontSize: 14, color: 'var(--outline)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Phone: +91 {profile?.phone?.replace('+91', '') || user.phone?.replace('+91', '')}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>Personal Details</h3>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving || name === profile?.full_name}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Menu */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 20, padding: 8, marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
          {[
            { label: 'My Orders', path: '/orders' },
            { label: 'Saved Addresses', path: '/profile/addresses' },
            { label: 'Help & Support', path: '/support' },
            { label: 'Terms & Privacy', path: '/terms' },
          ].map((item, i) => (
            <div key={i} onClick={() => navigate(item.path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: i < 3 ? '1px solid var(--surface-container)' : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{item.label}</span>
              </div>
              {/* Removed chevron for strictly text-only look */}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div style={{ marginBottom: 24 }}>
            <button className="btn-primary" onClick={() => navigate('/admin')} style={{ background: 'linear-gradient(135deg, var(--tertiary), var(--tertiary-container))' }}>
              Open Admin Dashboard
            </button>
          </div>
        )}

        <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1.5px solid var(--error)', color: 'var(--error)', borderRadius: 999, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Logout
        </button>
      </div>

    </div>
  );
}

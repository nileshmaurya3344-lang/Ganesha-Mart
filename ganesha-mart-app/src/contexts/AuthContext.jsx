import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, ADMIN_PHONE } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gm_mock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('gm_mock_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        // If no supabase session, we might already have mock state from useState initializer
        if (user && profile) {
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        // Only clear if not in mock mode?
        // Let's check if we have a mock flag
        if (!localStorage.getItem('gm_mock_user')) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function signInWithOtp(phone) {
    // Mock OTP for testing
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.endsWith('9999900000') || cleanPhone.length >= 10) {
      console.log('Mock OTP sent for', phone);
      return { data: { message: 'OTP Sent' }, error: null };
    }
    return supabase.auth.signInWithOtp({ phone });
  }

  async function verifyOtp(phone, token) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check for mock admin
    if (cleanPhone.endsWith('9999900000') && token === '123456') {
      const mockUser = { id: '00000000-0000-0000-0000-000000000001', phone: '+919999900000', email: 'admin@ganeshamart.test' };
      const mockProfile = { id: mockUser.id, full_name: 'Admin User', phone: '9999900000' };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('gm_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('gm_mock_profile', JSON.stringify(mockProfile));
      return { data: { user: mockUser }, error: null };
    }

    // Check for mock customer
    if (cleanPhone.length >= 10 && token === '000000') {
      const mockUser = { id: `00000000-0000-0000-0000-${cleanPhone.slice(-12).padStart(12, '0')}`, phone: phone, email: `${cleanPhone}@customer.test` };
      const mockProfile = { id: mockUser.id, full_name: 'Customer', phone: cleanPhone.slice(-10) };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('gm_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('gm_mock_profile', JSON.stringify(mockProfile));
      return { data: { user: mockUser }, error: null };
    }

    return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  }

  async function signOut() {
    localStorage.removeItem('gm_mock_user');
    localStorage.removeItem('gm_mock_profile');
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
  }

  const isAdmin = profile?.phone === ADMIN_PHONE || user?.phone === ADMIN_PHONE;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

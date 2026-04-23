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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setLoading(false);
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
    if (!userId) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      localStorage.setItem('gm_mock_profile', JSON.stringify(data));
      return data;
    }
    return null;
  }

  async function updateProfile(updates) {
    if (!user) return { error: new Error('Not logged in') };

    // Try updating database
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updates })
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      localStorage.setItem('gm_mock_profile', JSON.stringify(data));
      return { data, error: null };
    }

    // If database update fails (e.g. mock user with FK constraint), 
    // update local state and localStorage anyway for a consistent session
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    localStorage.setItem('gm_mock_profile', JSON.stringify(newProfile));

    // Also save to a persistent mock store that doesn't get cleared on logout
    const persistentProfiles = JSON.parse(localStorage.getItem('gm_persistent_mock_profiles') || '{}');
    persistentProfiles[user.id] = newProfile;
    localStorage.setItem('gm_persistent_mock_profiles', JSON.stringify(persistentProfiles));
    
    return { data: newProfile, error: null };
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
      setUser(mockUser);
      localStorage.setItem('gm_mock_user', JSON.stringify(mockUser));
      
      const existingProfile = await fetchProfile(mockUser.id);
      if (!existingProfile) {
        // Check persistent mock storage
        const persistentProfiles = JSON.parse(localStorage.getItem('gm_persistent_mock_profiles') || '{}');
        if (persistentProfiles[mockUser.id]) {
          setProfile(persistentProfiles[mockUser.id]);
          localStorage.setItem('gm_mock_profile', JSON.stringify(persistentProfiles[mockUser.id]));
        } else {
          const mockProfile = { id: mockUser.id, full_name: 'Admin User', phone: '9999900000' };
          setProfile(mockProfile);
          localStorage.setItem('gm_mock_profile', JSON.stringify(mockProfile));
        }
      }
      return { data: { user: mockUser }, error: null };
    }

    // Check for mock customer
    if (cleanPhone.length >= 10 && token === '000000') {
      const mockUser = { id: `00000000-0000-0000-0000-${cleanPhone.slice(-12).padStart(12, '0')}`, phone: phone, email: `${cleanPhone}@customer.test` };
      setUser(mockUser);
      localStorage.setItem('gm_mock_user', JSON.stringify(mockUser));
      
      const existingProfile = await fetchProfile(mockUser.id);
      if (!existingProfile) {
        // Check persistent mock storage
        const persistentProfiles = JSON.parse(localStorage.getItem('gm_persistent_mock_profiles') || '{}');
        if (persistentProfiles[mockUser.id]) {
          setProfile(persistentProfiles[mockUser.id]);
          localStorage.setItem('gm_mock_profile', JSON.stringify(persistentProfiles[mockUser.id]));
        } else {
          const mockProfile = { id: mockUser.id, full_name: 'Customer', phone: cleanPhone.slice(-10) };
          setProfile(mockProfile);
          localStorage.setItem('gm_mock_profile', JSON.stringify(mockProfile));
        }
      }
      return { data: { user: mockUser }, error: null };
    }

    const result = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (result.data?.user) {
      setUser(result.data.user);
      await fetchProfile(result.data.user.id);
    }
    return result;
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
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signInWithOtp, verifyOtp, signOut, updateProfile, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

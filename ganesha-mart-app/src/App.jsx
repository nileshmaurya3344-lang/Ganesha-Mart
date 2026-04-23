import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { StoreProvider } from './contexts/StoreContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import AdminStoreStatus from './pages/AdminStoreStatus';
import AdminDeliverySettings from './pages/AdminDeliverySettings';
import SavedAddresses from './pages/SavedAddresses';
import OrderSuccess from './pages/OrderSuccess';
import Search from './pages/Search';
import Support from './pages/Support';
import Terms from './pages/Terms';
import BottomNav from './components/BottomNav';

function AppContent() {
  const location = useLocation();
   const hideNavOn = ['/login', '/checkout', '/admin/orders', '/admin/store-status', '/admin/delivery-settings', '/profile/addresses', '/order-success', '/product', '/support', '/terms'];
  const showNav = !hideNavOn.map(path => location.pathname.startsWith(path)).includes(true);

  return (
    <div id="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/addresses" element={<SavedAddresses />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/store-status" element={<AdminStoreStatus />} />
        <Route path="/admin/delivery-settings" element={<AdminDeliverySettings />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <CartProvider>
            <AppContent />
            <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'toast-container',
              style: {
                background: 'var(--on-surface)',
                color: 'var(--surface)',
                borderRadius: 'var(--radius-full)',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600
              }
            }} 
          />
          </CartProvider>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

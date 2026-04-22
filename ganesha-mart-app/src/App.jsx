import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Search from './pages/Search';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div id="app-shell">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/search" element={<Search />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) searchProducts(query);
      else setProducts([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  async function searchProducts(q) {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .ilike('name', `%${q}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="page fade-in" style={{ background: 'var(--surface-lowest)' }}>
      <div style={{ padding: '16px', position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-lowest)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--on-surface)" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div className="search-bar" style={{ flex: 1, padding: '8px 16px' }}>
            <input 
              autoFocus 
              placeholder="Search for groceries..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--outline)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : query.length > 1 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--outline)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No products found</h3>
            <p>Try searching for something else</p>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 14, color: 'var(--outline)', marginBottom: 12 }}>Trending Searches</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['Milk', 'Bread', 'Eggs', 'Potato', 'Onion', 'Maggi'].map(term => (
                <span key={term} className="chip" onClick={() => setQuery(term)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

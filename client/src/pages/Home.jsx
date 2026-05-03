import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QrCode } from 'lucide-react';
import MenuItem from '../components/MenuItem';
import CategoryBar from '../components/CategoryBar';
import { useOrder } from '../context/OrderContext';

const CATS = ['All', 'North Indian', 'South Indian', 'Chinese', 'Beverages'];

export default function Home() {
  const [searchParams] = useSearchParams();
  const [menu, setMenu]         = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading]   = useState(true);

  const { cart, setShowCart, tableNumber, setTableNumber, totalAmount, API, activeOrder } = useOrder();

  // Detect table from URL
  useEffect(() => {
    const t = searchParams.get('table');
    if (t) setTableNumber(t);
  }, [searchParams]);

  // Fetch menu
  useEffect(() => {
    axios.get(`${API}/api/menu`)
      .then(r => setMenu(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = category === 'All' ? menu : menu.filter(i => i.category === category);

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ fontSize: '1.6rem' }}>Namaste 🙏</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>What would you like to eat today?</p>
      </div>

      {/* No table → ask */}
      {!tableNumber && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dk))',
          color: '#fff', borderRadius: 16, padding: '20px',
          marginBottom: 16, textAlign: 'center'
        }}>
          <QrCode size={36} style={{ marginBottom: 10, opacity: 0.9 }} />
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Scan the QR code on your table</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: 14 }}>
            Or enter your table number manually below
          </p>
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Table number"
            style={{ maxWidth: 160, textAlign: 'center', margin: '0 auto', display: 'block' }}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || parseInt(val) >= 1) setTableNumber(val);
            }}
          />
        </div>
      )}

      {/* Table confirmed banner */}
      {tableNumber && (
        <div style={{
          background: '#EAFAF1', borderRadius: 12, padding: '10px 16px',
          marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid #D5F5E3'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--green)', width: 8, height: 8, borderRadius: '50%' }}></div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#145A32' }}>Table {tableNumber}</span>
          </div>
          <button 
            onClick={() => { setTableNumber(''); localStorage.removeItem('zaayka_table'); }}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
          >
            Change
          </button>
        </div>
      )}

      {/* Active Order tracking banner */}
      {activeOrder && (
        <Link to={`/track/${activeOrder._id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '10px 14px',
            marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(255, 77, 77, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🛵</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Track Active Order</span>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Status: {activeOrder.status} →</span>
          </div>
        </Link>
      )}

      {/* Categories */}
      <CategoryBar categories={CATS} active={category} onSelect={setCategory} />

      {/* Menu items */}
      {loading ? (
        <p className="text-center text-muted" style={{ padding: 40 }}>Loading menu…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted" style={{ padding: 40 }}>No items available</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {filtered.map(item => <MenuItem key={item._id} item={item} />)}
        </div>
      )}

      {/* Floating cart bar */}
      {cart.length > 0 && (
        <div className="cart-bar">
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px 20px', fontSize: '1rem', boxShadow: '0 8px 24px rgba(255,77,77,0.35)' }}
            onClick={() => setShowCart(true)}
          >
            <span>🛒 {cart.reduce((s, i) => s + i.quantity, 0)} items</span>
            <span style={{ marginLeft: 'auto' }}>₹{totalAmount} →</span>
          </button>
        </div>
      )}
    </div>
  );
}

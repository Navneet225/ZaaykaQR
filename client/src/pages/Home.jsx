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

      {/* Active Order tracking banner */}
      {activeOrder && (
        <Link to={`/track/${activeOrder._id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF4D4D, #E03E3E)',
            color: 'white', borderRadius: 16, padding: '16px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 8px 24px rgba(255, 77, 77, 0.25)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              width: 48, height: 48, borderRadius: 12, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              {activeOrder.status === 'Delivered' ? '✅' : '👨‍🍳'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 2 }}>Current Order Status</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {activeOrder.status === 'Received' && 'Order received by kitchen'}
                {activeOrder.status === 'Preparing' && 'Chef is preparing your meal'}
                {activeOrder.status === 'Ready' && 'Food is ready to serve!'}
                {activeOrder.status === 'Delivered' && 'Order delivered. Enjoy!'}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
              Track →
            </div>
          </div>
        </Link>
      )}

      {/* Table confirmed banner */}
      {tableNumber && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '12px 16px',
          marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#27AE60', width: 10, height: 10, borderRadius: '50%', boxShadow: '0 0 0 4px rgba(39, 174, 96, 0.1)' }}></div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#145A32' }}>Table {tableNumber}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 1 }}>Digital Menu Active</p>
            </div>
          </div>
          <button 
            onClick={() => { setTableNumber(''); localStorage.removeItem('zaayka_table'); }}
            style={{ background: '#f8f8f8', border: '1px solid #eee', padding: '6px 12px', borderRadius: 8, color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Change
          </button>
        </div>
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

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function Header() {
  const { cart, setShowCart } = useOrder();
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: 'var(--primary)', padding: '7px', borderRadius: '10px', display: 'flex' }}>
            <UtensilsCrossed size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>
            Zaayka<span style={{ color: 'var(--primary)' }}>QR</span>
          </span>
        </Link>

        <button
          onClick={() => setShowCart(true)}
          style={{ background: 'none', border: 'none', position: 'relative', padding: 4 }}
          aria-label="Open cart"
        >
          <ShoppingCart size={26} color={count ? 'var(--primary)' : 'var(--muted)'} />
          {count > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: 'var(--primary)', color: '#fff',
              borderRadius: '50%', width: 19, height: 19,
              fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{count}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

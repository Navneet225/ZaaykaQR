import { useOrder } from '../context/OrderContext';
import { Plus, Minus } from 'lucide-react';

export default function MenuItem({ item }) {
  const { cart, addToCart, removeFromCart } = useOrder();
  const inCart = cart.find(i => i._id === item._id);

  return (
    <div className="card flex-between" style={{ padding: '14px 16px', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{item.name}</p>
        <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 6 }}>{item.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>₹{item.price}</span>
          <span className="text-muted" style={{ fontSize: '0.78rem' }}>⏱ {item.prepTime} min</span>
        </div>
      </div>

      <div>
        {!inCart ? (
          <button
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.9rem' }}
            onClick={() => addToCart(item)}
          >
            <Plus size={16} /> Add
          </button>
        ) : (
          <div className="qty">
            <button onClick={() => removeFromCart(item._id)}><Minus size={16} /></button>
            <span>{inCart.quantity}</span>
            <button onClick={() => addToCart(item)}><Plus size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

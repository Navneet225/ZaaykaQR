import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Trash2, Gift, Phone, QrCode, Banknote, ChevronRight, Star } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

export default function CartModal() {
  const {
    cart, removeFromCart, clearCart,
    tableNumber, setTableNumber,
    totalAmount, setShowCart,
    setActiveOrder, setLoyaltyPoints,
    API
  } = useOrder();

  const [phone,         setPhone]         = useState('');
  const [existingPoints, setExistingPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(''); // '' = not chosen yet
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const navigate = useNavigate();

  // Fetch existing points when 10-digit phone is entered
  React.useEffect(() => {
    if (phone.length === 10) {
      axios.get(`${API}/api/users/${phone}`)
        .then(r => setExistingPoints(r.data.points))
        .catch(() => setExistingPoints(0));
    } else {
      setExistingPoints(0);
    }
  }, [phone, API]);

  const handleOrder = async () => {
    if (cart.length === 0)     return;
    if (!tableNumber)          { setError('Please enter your table number'); return; }
    if (!paymentMethod)        { setError('Please choose a payment method'); return; }
    setError('');
    setLoading(true);

    try {
      const payload = {
        table:         Number(tableNumber),
        items:         cart.map(i => ({ _id: i._id, name: i.name, price: i.price, quantity: i.quantity, prepTime: i.prepTime || 5 })),
        total:         totalAmount,
        phone:         phone.trim() || undefined,
        paymentMethod,
      };

      const { data } = await axios.post(`${API}/api/orders`, payload);
      setActiveOrder(data.order);
      if (data.pointsEarned) setLoyaltyPoints(data.totalPoints || data.pointsEarned);
      clearCart();
      setShowCart(false);
      navigate(`/track/${data.order._id}`, {
        state: { pointsEarned: data.pointsEarned, totalPoints: data.totalPoints }
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Could not place order. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="overlay" onClick={() => setShowCart(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex-between mb2">
          <h2 style={{ fontSize: '1.3rem' }}>Your Cart</h2>
          <button style={{ background:'none', border:'none' }} onClick={() => setShowCart(false)}>
            <X size={22} />
          </button>
        </div>

        {/* Empty */}
        {cart.length === 0 ? (
          <div className="text-center" style={{ padding:'40px 0', color:'var(--muted)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <p className="fw700 mt2">Your cart is empty</p>
            <p style={{ fontSize:'0.85rem', marginTop:4 }}>Please add items from the menu</p>
          </div>
        ) : (
          <>
            {/* Items */}
            {cart.map(item => (
              <div key={item._id} className="flex-between" style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                <div>
                  <p className="fw700">{item.name} <span className="text-muted" style={{ fontWeight:400 }}>× {item.quantity}</span></p>
                  <p className="text-primary fw700">₹{item.price * item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item._id)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {/* Total */}
            <div className="flex-between" style={{ marginTop:16, marginBottom:20 }}>
              <span className="fw700" style={{ fontSize:'1.1rem' }}>Total</span>
              <span className="fw700 text-primary" style={{ fontSize:'1.3rem' }}>₹{totalAmount}</span>
            </div>

            {/* Table number */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:6, display:'block' }}>Table Number *</label>
              <input className="input" type="number" placeholder="e.g. 5"
                value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
            </div>

            {/* Phone optional */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:6, display:'flex', alignItems:'center', gap:6 }}>
                <Phone size={14} /> Mobile Number
                <span className="text-muted" style={{ fontWeight:400, fontSize:'0.8rem' }}>(optional — earn rewards)</span>
              </label>
              <input className="input" type="tel" placeholder="Enter to earn loyalty points"
                value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} />
              
              {phone.length === 10 && (
                <div style={{ background:'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', borderRadius:12, padding:'14px', marginTop:12, border:'1px solid var(--border)', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize:'0.85rem', color:'var(--text)', display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Star size={14} color="#f1c40f" fill="#f1c40f" /> Past Points:</span>
                    <span className="fw700">{existingPoints} pts</span>
                  </p>
                  <p style={{ fontSize:'0.85rem', color:'var(--green)', display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Gift size={14} /> This Order:</span>
                    <span className="fw700">+{Math.floor(totalAmount/10)} pts</span>
                  </p>
                  <div style={{ borderTop:'2px solid #fff', marginTop:10, paddingTop:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className="fw700" style={{ fontSize:'0.9rem', color:'var(--text)' }}>Total Balance After Order:</span>
                    <span className="fw700 text-primary" style={{ fontSize:'1.1rem', background:'var(--primary)', color:'#fff', padding:'2px 10px', borderRadius:20 }}>{existingPoints + Math.floor(totalAmount/10)} pts</span>
                  </div>
                </div>
              )}

              {phone.length < 10 && totalAmount > 0 && (
                <p style={{ fontSize:'0.8rem', color:'var(--green)', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                  <Gift size={13} /> You&apos;ll earn <strong>{Math.floor(totalAmount/10)} points</strong> on this order
                </p>
              )}
            </div>

            {/* ── PAYMENT METHOD ─────────────────────────────────── */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontWeight:700, fontSize:'0.95rem', display:'block', marginBottom:10 }}>
                💳 How would you like to pay?
              </label>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {/* UPI option */}
                <button
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: paymentMethod === 'upi' ? '#FFF0F0' : '#fff',
                    borderRadius:12, padding:'14px 10px', cursor:'pointer',
                    textAlign:'center', transition:'all 0.15s'
                  }}
                >
                  <QrCode size={28} color={paymentMethod === 'upi' ? 'var(--primary)' : 'var(--muted)'} style={{ marginBottom:6 }} />
                  <p style={{ fontWeight:700, fontSize:'0.9rem', color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text)' }}>Pay via UPI</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>GPay · PhonePe · Paytm</p>
                </button>

                {/* Cash option */}
                <button
                  onClick={() => setPaymentMethod('cash')}
                  style={{
                    border: paymentMethod === 'cash' ? '2px solid var(--green)' : '2px solid var(--border)',
                    background: paymentMethod === 'cash' ? '#EAFAF1' : '#fff',
                    borderRadius:12, padding:'14px 10px', cursor:'pointer',
                    textAlign:'center', transition:'all 0.15s'
                  }}
                >
                  <Banknote size={28} color={paymentMethod === 'cash' ? 'var(--green)' : 'var(--muted)'} style={{ marginBottom:6 }} />
                  <p style={{ fontWeight:700, fontSize:'0.9rem', color: paymentMethod === 'cash' ? 'var(--green)' : 'var(--text)' }}>Pay by Cash</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>Pay when food arrives</p>
                </button>
              </div>
            </div>

            {error && <p style={{ color:'var(--primary)', marginBottom:12, fontSize:'0.85rem' }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ width:'100%', padding:'14px', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}
              onClick={handleOrder}
              disabled={loading || cart.length === 0}
            >
              {loading ? 'Placing Order…' : (
                <>Place Order · ₹{totalAmount} <ChevronRight size={18} /></>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

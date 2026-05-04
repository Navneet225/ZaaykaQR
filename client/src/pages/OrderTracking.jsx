import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, Clock, ChefHat, PackageCheck, Star, Banknote, QrCode } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const STEPS = [
  { key:'Received',  icon:<Clock size={15}/>,        label:'Aapka order mil gaya hai', sub:'Order received — kitchen notified' },
  { key:'Preparing', icon:<ChefHat size={15}/>,      label:'Ban raha hai…',             sub:'Our chefs are cooking your food' },
  { key:'Ready',     icon:<PackageCheck size={15}/>, label:'Table par aa raha hai!',   sub:'Food is on its way to your table' },
  { key:'Delivered', icon:<CheckCircle size={15}/>,  label:'Kha lo bhai! 😄',          sub:'Order delivered — enjoy your meal' },
];

const FUNNY_MESSAGES = [
  "(Maggi nahi hai bhai, time lagega! 🔥)",
  "(Chef sabar ki pariksha le rahe hain 👨‍🍳)",
  "(Acha khana time mangta hai dost! ⏳)",
  "(Food is getting a VIP treatment! ✨)",
  "(Sabar ka phal meetha hota hai! 🍎)",
  "(Almost there! Pet puja loading... 🍽️)"
];

export default function OrderTracking() {
  const { id }    = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { activeOrder, setActiveOrder, API } = useOrder();

  const [order,      setOrder]      = useState(activeOrder?._id === id ? activeOrder : null);
  const [vendorUpi,  setVendorUpi]  = useState('vendor@upi');
  const [vendorName, setVendorName] = useState('ZaaykaQR');

  const pts          = location.state?.pointsEarned;
  const totalPts     = location.state?.totalPoints;

  // Fetch vendor UPI config once
  useEffect(() => {
    axios.get(`${API}/api/config`)
      .then(r => { setVendorUpi(r.data.vendorUpi); setVendorName(r.data.vendorName); })
      .catch(() => {});
  }, [API]);

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/orders/${id}`);
      setOrder(data);
      setActiveOrder(data);
    } catch (e) {
      console.error('Fetch order failed', e);
    }
  }, [API, id, setActiveOrder]);

  useEffect(() => { 
    fetchOrder(); 
    const iv = setInterval(fetchOrder, 5000);
    return () => clearInterval(iv);
  }, [fetchOrder]);

  if (!order) return (
    <div className="text-center" style={{ padding:60, color:'var(--muted)' }}>
      <p>Loading your order…</p>
    </div>
  );

  const currentIdx = STEPS.findIndex(s => s.key === order.status);
  const etaMin = order.eta;
  const etaMax = etaMin + 3;

  const getFunnyMessage = (orderId) => {
    if (!orderId) return FUNNY_MESSAGES[0];
    const hash = orderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FUNNY_MESSAGES[hash % FUNNY_MESSAGES.length];
  };

  const funnyMessage = getFunnyMessage(order?._id);

  const badgeClass = {
    Received:'badge-received', Preparing:'badge-preparing',
    Ready:'badge-ready',       Delivered:'badge-delivered'
  }[order.status] || 'badge-received';

  // Build UPI deep-link
  const upiLink = `upi://pay?pa=${encodeURIComponent(vendorUpi)}&pn=${encodeURIComponent(vendorName)}&am=${order.total}&cu=INR&tn=Order%20%23${String(order._id).slice(-6).toUpperCase()}`;

  const isPaid = order.paymentStatus === 'paid';

  return (
    <div className="container" style={{ paddingTop:20, paddingBottom:40 }}>

      {/* Points banner */}
      {pts > 0 && (
        <div style={{ background:'linear-gradient(135deg,#27AE60,#2ECC71)', color:'#fff', borderRadius:12, padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
          <Star size={20} fill="#fff" />
          <div>
            <p style={{ fontWeight:700 }}>🎉 You earned {pts} points!</p>
            <p style={{ fontSize:'0.82rem', opacity:0.9 }}>Total: {totalPts || pts} points in your account</p>
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="card">
        <div className="flex-between mb2">
          <div>
            <p className="text-muted" style={{ fontSize:'0.75rem' }}>ORDER ID</p>
            <p style={{ fontWeight:800, fontSize:'1rem', letterSpacing:1 }}>#{String(order._id).slice(-6).toUpperCase()}</p>
          </div>
          <span className={`badge ${badgeClass}`}>{order.status}</span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          <div>
            <p className="text-muted" style={{ fontSize:'0.72rem' }}>TABLE</p>
            <p className="fw700">Table {order.table}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="text-muted" style={{ fontSize:'0.72rem' }}>ETA</p>
            <p className="fw700">{etaMin}–{etaMax} min</p>
            <p className="text-muted" style={{ fontSize:'0.65rem', marginTop:2 }}>{funnyMessage}</p>
          </div>
          <div>
            <p className="text-muted" style={{ fontSize:'0.72rem' }}>TOTAL</p>
            <p className="fw700 text-primary">₹{order.total}</p>
          </div>
        </div>
      </div>

      {/* Live timeline */}
      <div className="card">
        <p className="fw700 mb2">Live Status</p>
        <div className="timeline">
          {STEPS.map((step, idx) => {
            const done   = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={step.key} className={`tl-item${done?' done':active?' active':''}`}>
                <div className="tl-dot">{step.icon}</div>
                <div className="tl-body">
                  <p className="tl-title">{step.label}</p>
                  <p className="tl-sub">{step.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Items ordered */}
      <div className="card">
        <p className="fw700 mb2">Items Ordered</p>
        {order.items.map((item, i) => (
          <div key={i} className="flex-between" style={{ padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
            <span>{item.name} × {item.quantity}</span>
            <span className="text-primary fw700">₹{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      {/* ── PAYMENT SECTION ──────────────────────────────────────── */}
      {order.paymentMethod === 'upi' ? (
        <div className="card text-center">
          {isPaid ? (
            /* Paid confirmation */
            <div style={{ padding:'20px 0' }}>
              <div style={{ width:60, height:60, background:'#EAFAF1', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                <CheckCircle size={32} color="var(--green)" />
              </div>
              <p className="fw700" style={{ fontSize:'1.1rem', color:'var(--green)' }}>Payment Confirmed! ✅</p>
              <p className="text-muted" style={{ fontSize:'0.85rem', marginTop:4 }}>₹{order.total} paid via UPI</p>
            </div>
          ) : (
            /* UPI payment QR */
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:4 }}>
                <QrCode size={20} color="var(--primary)" />
                <p className="fw700" style={{ fontSize:'1rem' }}>Scan to Pay ₹{order.total}</p>
              </div>
              <p className="text-muted" style={{ fontSize:'0.82rem', marginBottom:16 }}>
                Open GPay · PhonePe · Paytm and scan this code
              </p>

              <div style={{ background:'#f8f8f8', display:'inline-block', padding:16, borderRadius:16, marginBottom:12 }}>
                <QRCodeSVG
                  value={upiLink}
                  size={180}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23FF4D4D' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z'/%3E%3C/svg%3E",
                    height: 32, width: 32, excavate: true
                  }}
                />
              </div>

              {/* UPI app quick-launch buttons */}
              <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap', marginBottom:16 }}>
                {[
                  { name:'GPay',    url:`tez://upi/pay?pa=${vendorUpi}&pn=${vendorName}&am=${order.total}&cu=INR` },
                  { name:'PhonePe', url:`phonepe://pay?pa=${vendorUpi}&pn=${vendorName}&am=${order.total}&cu=INR` },
                  { name:'Paytm',   url:`paytmmp://pay?pa=${vendorUpi}&pn=${vendorName}&am=${order.total}&cu=INR` },
                ].map(app => (
                  <a key={app.name} href={app.url}
                    style={{ background:'#f1f1f1', borderRadius:8, padding:'6px 14px', fontSize:'0.82rem', fontWeight:600, color:'var(--text)', textDecoration:'none', border:'1px solid var(--border)' }}>
                    {app.name}
                  </a>
                ))}
              </div>

              <p style={{ fontSize:'0.78rem', color:'var(--muted)' }}>
                UPI ID: <strong>{vendorUpi}</strong>
              </p>
              <p style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:4 }}>
                ⚡ Payment status updates automatically after vendor confirms
              </p>
            </>
          )}
        </div>
      ) : (
        /* Cash payment card */
        <div className="card" style={{ borderLeft:'4px solid var(--green)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background:'#EAFAF1', padding:12, borderRadius:12 }}>
              <Banknote size={28} color="var(--green)" />
            </div>
            <div>
              {isPaid ? (
                <>
                  <p className="fw700" style={{ color:'var(--green)' }}>Cash Received ✅</p>
                  <p className="text-muted" style={{ fontSize:'0.82rem' }}>₹{order.total} collected by vendor</p>
                </>
              ) : (
                <>
                  <p className="fw700">Pay by Cash on Delivery</p>
                  <p className="text-muted" style={{ fontSize:'0.82rem', marginTop:2 }}>
                    Keep <strong>₹{order.total}</strong> ready — pay when food arrives at your table
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <button className="btn btn-ghost" style={{ width:'100%', marginTop:16 }} onClick={() => navigate('/')}>
        ← Order More
      </button>
    </div>
  );
}

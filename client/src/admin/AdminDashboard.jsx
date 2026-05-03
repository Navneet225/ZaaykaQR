import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, BarChart2, QrCode, ClipboardList, Download, CheckCircle, IndianRupee, Banknote } from 'lucide-react';

const API = 'http://localhost:5000';

function authHeader() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };
}

export default function AdminDashboard() {
  const [tab,       setTab]       = useState('orders');
  const [orders,    setOrders]    = useState([]);
  const [analytics, setAnalytics] = useState({ totalOrders:0, totalRevenue:0, upiRevenue:0, cashRevenue:0, pendingRevenue:0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) navigate('/admin/login');
  }, []);

  const fetchOrders    = async () => { try { const { data } = await axios.get(`${API}/api/admin/orders`, authHeader()); setOrders(data); } catch { logout(); } };
  const fetchAnalytics = async () => { try { const { data } = await axios.get(`${API}/api/admin/analytics`, authHeader()); setAnalytics(data); } catch {} };

  useEffect(() => { fetchOrders(); fetchAnalytics(); }, []);

  useEffect(() => {
    const socket = io(API, { transports: ['websocket','polling'] });
    socket.on('newOrder',    () => { fetchOrders(); fetchAnalytics(); });
    socket.on('orderUpdate', () => { fetchOrders(); fetchAnalytics(); });
    return () => socket.disconnect();
  }, []);

  const updateOrder = async (id, patch) => {
    try { await axios.patch(`${API}/api/orders/${id}`, patch, authHeader()); fetchOrders(); fetchAnalytics(); } catch {}
  };

  const logout = () => { localStorage.removeItem('adminToken'); navigate('/admin/login'); };

  const TABS = [
    { key:'orders',    label:'Orders',    icon:<ClipboardList size={15}/> },
    { key:'analytics', label:'Analytics', icon:<BarChart2 size={15}/> },
    { key:'qr',        label:'QR Codes',  icon:<QrCode size={15}/> },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Topbar */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200 }}>
        <div>
          <p style={{ fontWeight:800, fontSize:'1.1rem' }}>🍽️ ZaaykaQR Admin</p>
          <p className="text-muted" style={{ fontSize:'0.75rem' }}>Live Kitchen Dashboard</p>
        </div>
        <button className="btn btn-ghost" style={{ padding:'8px 14px', fontSize:'0.85rem' }} onClick={logout}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ background:'#fff', borderBottom:'1px solid var(--border)', display:'flex' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:'12px 8px', border:'none', background:'none',
            fontWeight:600, fontSize:'0.85rem', cursor:'pointer',
            borderBottom: tab===t.key ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: tab===t.key ? 'var(--primary)' : 'var(--muted)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth:700, margin:'0 auto', padding:16 }}>
        {tab==='orders'    && <OrdersTab    orders={orders}       updateOrder={updateOrder} />}
        {tab==='analytics' && <AnalyticsTab analytics={analytics} />}
        {tab==='qr'        && <QRTab />}
      </div>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ orders, updateOrder }) {
  if (!orders.length) return (
    <div className="text-center" style={{ padding:60, color:'var(--muted)' }}>
      <p style={{ fontSize:'2rem' }}>🔕</p>
      <p className="fw700 mt1">No orders yet</p>
      <p style={{ fontSize:'0.85rem', marginTop:4 }}>Waiting for customers…</p>
    </div>
  );

  const borderColor = { Received:'#2980B9', Preparing:'#F39C12', Ready:'#27AE60', Delivered:'#ccc' };

  return orders.map(order => (
    <div key={order._id} className="card" style={{ borderLeft:`4px solid ${borderColor[order.status]||'#ccc'}` }}>
      {/* Header row */}
      <div className="flex-between mb1">
        <div>
          <p className="fw700" style={{ fontSize:'1rem' }}>🪑 Table {order.table}</p>
          <p className="text-muted" style={{ fontSize:'0.75rem' }}>
            #{String(order._id).slice(-6).toUpperCase()} · ETA {order.eta} min
          </p>
        </div>
        <div style={{ textAlign:'right' }}>
          <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
          <p className="fw700 text-primary" style={{ marginTop:4 }}>₹{order.total}</p>
        </div>
      </div>

      {/* Items */}
      <p style={{ fontSize:'0.88rem', marginBottom:8 }}>
        {order.items.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
      </p>

      {order.phone && <p className="text-muted" style={{ fontSize:'0.75rem', marginBottom:8 }}>📱 {order.phone}</p>}

      {/* Payment status row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'8px 10px', borderRadius:8, background: order.paymentStatus==='paid' ? '#EAFAF1' : '#FEF9E7' }}>
        {order.paymentMethod === 'upi'
          ? <QrCode size={15} color={order.paymentStatus==='paid' ? 'var(--green)' : 'var(--orange)'} />
          : <Banknote size={15} color={order.paymentStatus==='paid' ? 'var(--green)' : 'var(--orange)'} />
        }
        <span style={{ fontWeight:600, fontSize:'0.82rem', color: order.paymentStatus==='paid' ? 'var(--green)' : 'var(--orange)' }}>
          {order.paymentMethod === 'upi' ? 'UPI' : 'Cash'} · {order.paymentStatus === 'paid' ? 'Paid ✅' : 'Payment Pending'}
        </span>

        {/* Mark as paid button */}
        {order.paymentStatus !== 'paid' && (
          <button
            className="btn"
            style={{ marginLeft:'auto', padding:'4px 10px', fontSize:'0.78rem', background:'var(--green)', color:'#fff', borderRadius:6 }}
            onClick={() => updateOrder(order._id, { paymentStatus:'paid' })}
          >
            <CheckCircle size={13} /> Mark Paid
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {order.status==='Received'  && <button className="btn btn-orange" onClick={() => updateOrder(order._id,{ status:'Preparing' })}>✅ Accept</button>}
        {order.status==='Preparing' && <button className="btn btn-green"  onClick={() => updateOrder(order._id,{ status:'Ready' })}>🔔 Ready</button>}
        {order.status==='Ready'     && <button className="btn btn-ghost"  onClick={() => updateOrder(order._id,{ status:'Delivered' })}>📦 Delivered</button>}
        {order.status==='Delivered' && <span className="text-muted" style={{ fontSize:'0.82rem' }}>✔ Completed</span>}
      </div>
    </div>
  ));
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab({ analytics }) {
  const cards = [
    { label:'Orders Today',    value: analytics.totalOrders,    color:'var(--text)',    prefix:'' },
    { label:'Total Revenue',   value: analytics.totalRevenue,   color:'var(--primary)', prefix:'₹' },
    { label:'UPI Collected',   value: analytics.upiRevenue,     color:'#6C3483',        prefix:'₹' },
    { label:'Cash Collected',  value: analytics.cashRevenue,    color:'var(--green)',   prefix:'₹' },
    { label:'Pending Payment', value: analytics.pendingRevenue, color:'var(--orange)',  prefix:'₹' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
      {cards.map(c => (
        <div key={c.label} className="card text-center" style={{ padding:20 }}>
          <p style={{ fontSize:'2rem', fontWeight:800, color:c.color }}>{c.prefix}{c.value}</p>
          <p className="text-muted" style={{ fontSize:'0.82rem' }}>{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── QR Tab ────────────────────────────────────────────────────────────────────
function QRTab() {
  const [table, setTable] = useState('1');
  const qrUrl = `${window.location.origin}/menu?table=${table}`;

  const downloadQR = () => {
    const svg = document.getElementById('admin-qr');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    // Set a good resolution for the download
    canvas.width = 400;
    canvas.height = 480; 
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR Code (centered, leaving space for text)
      ctx.drawImage(img, 40, 40, 320, 320);
      
      // Add text below
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#FF4D4D';
      ctx.textAlign = 'center';
      ctx.fillText(`TABLE ${table}`, 200, 420);
      
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan to view menu & order', 200, 450);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ZaaykaQR_Table_${table}.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="card text-center" style={{ padding:28 }}>
      <h3 style={{ marginBottom:16 }}>Table QR Generator</h3>
      <p className="text-muted" style={{ fontSize:'0.85rem', marginBottom:20 }}>
        Print and place this QR at each table. Customers scan to open the menu directly.
      </p>

      <div style={{ marginBottom:20 }}>
        <label style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:8, display:'block' }}>Table Number</label>
        <input className="input" type="number" min="1" value={table}
          onChange={e => {
            const val = e.target.value;
            if (val === '' || parseInt(val) >= 1) setTable(val);
          }}
          style={{ width:100, textAlign:'center', margin:'0 auto' }} />
      </div>

      <div style={{ background:'#f8f8f8', display:'inline-block', padding:20, borderRadius:16, marginBottom:16 }}>
        <QRCodeSVG id="admin-qr" value={qrUrl} size={200} level="H" includeMargin />
        <p style={{ fontWeight:800, fontSize:'1.1rem', marginTop:10, color:'var(--primary)' }}>TABLE {table}</p>
        <p className="text-muted" style={{ fontSize:'0.78rem' }}>Scan to view menu & order</p>
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={downloadQR}><Download size={16} /> Download PNG</button>
        <button className="btn btn-ghost"   onClick={() => window.print()}>🖨 Print</button>
      </div>

      <p className="text-muted" style={{ fontSize:'0.75rem', marginTop:14 }}>
        URL: <span style={{ color:'var(--primary)' }}>{qrUrl}</span>
      </p>
    </div>
  );
}

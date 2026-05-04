import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, UtensilsCrossed } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${API}/api/admin/login`, { username, password });
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } catch (e) {
      setError('Invalid credentials. Try admin / admin123');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div className="text-center" style={{ marginBottom: 32 }}>
          <div style={{ background: 'var(--primary)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <UtensilsCrossed size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem' }}>ZaaykaQR</h1>
          <p className="text-muted">Admin / Vendor Portal</p>
        </div>

        <form className="card" style={{ padding: 24 }} onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <User size={15} /> Username
            </label>
            <input className="input" type="text" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Lock size={15} /> Password
            </label>
            <input className="input" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginBottom: 12 }}>{error}</p>}

          <button className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
            {loading ? 'Logging in…' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="text-center text-muted" style={{ marginTop: 16, fontSize: '0.82rem' }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}

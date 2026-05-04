// Footer Component
import { useNavigate } from 'react-router-dom';
import { UserCog } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 16px', textAlign: 'center', marginTop: 16 }}>
      <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: 10 }}>
        © 2026 ZaaykaQR — Digital Menu System
      </p>
      <button
        onClick={() => navigate('/admin/login')}
        style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
      >
        <UserCog size={13} /> Vendor / Admin Login
      </button>
    </footer>
  );
}

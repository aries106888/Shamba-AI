import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.phone, form.password);
    if (result.ok) {
      toast.success('Welcome back!');
      navigate(result.role === 'farmer' ? '/farmer/dashboard' : result.role === 'buyer' ? '/buyer/dashboard' : '/admin');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--bg-base)' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, color:'var(--text-primary)', textDecoration:'none' }}>
            <Leaf size={32} color="#A8D65C"/>
            <div>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem', fontWeight:600 }}>ShambaPoint</div>
              <div style={{ fontSize:'0.7rem', color:'var(--lime)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Climate</div>
            </div>
          </Link>
          <h2 style={{ marginTop:'1.5rem', color:'var(--text-primary)' }}>Sign in to your account</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'0.88rem', marginTop:4 }}>Use your M-Pesa number</p>
        </div>

        <div className="glass-card" style={{ padding:'2rem' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div className="form-group">
              <label htmlFor="login-phone">M-Pesa Phone Number</label>
              <input id="login-phone" type="tel" placeholder="+254 7XX XXX XXX" value={form.phone}
                onChange={e=>setForm({...form,phone:e.target.value})} required autoComplete="tel" />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" placeholder="Your password" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.85rem' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
            Demo: farmer <code>+254711000001</code> / <code>farmer123</code><br/>
            Buyer: <code>+254700100001</code> / <code>buyer123</code>
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
          No account? <Link to="/register">Register for the pilot →</Link>
        </p>
      </div>
    </div>
  );
}

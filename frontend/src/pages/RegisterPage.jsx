import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTIES = ['Nairobi','Nakuru','Kirinyaga','Kericho','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Kitui','Mombasa','Nyandarua',"Murang'a",'Kajiado'];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState({ phone:'', password:'', email:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register({ ...form, role });
    if (result.ok) {
      toast.success('Account created! Welcome to ShambaPoint Climate.');
      navigate(result.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'var(--bg-base)' }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, color:'var(--text-primary)', textDecoration:'none' }}>
            <Leaf size={32} color="#A8D65C"/>
            <div>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem', fontWeight:600 }}>ShambaPoint</div>
              <div style={{ fontSize:'0.7rem', color:'var(--lime)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Climate</div>
            </div>
          </Link>
          <h2 style={{ marginTop:'1.5rem', color:'var(--text-primary)' }}>Create your account</h2>
        </div>

        <div className="glass-card" style={{ padding:'2rem' }}>
          {/* Role toggle */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1.5rem' }}>
            {['farmer','buyer'].map(r => (
              <button key={r} type="button"
                className={role===r ? 'btn-primary' : 'btn-secondary'}
                style={{ justifyContent:'center', padding:'0.7rem' }}
                onClick={()=>setRole(r)}>
                {r === 'farmer' ? '🌱 I am a Farmer' : '🏪 I am a Buyer'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group">
              <label htmlFor="reg-phone">M-Pesa Phone Number *</label>
              <input id="reg-phone" type="tel" placeholder="+254 7XX XXX XXX" value={form.phone}
                onChange={e=>setForm({...form,phone:e.target.value})} required autoComplete="tel" />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email (optional)</label>
              <input id="reg-email" type="email" placeholder="you@example.co.ke" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email" />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password">Password *</label>
              <input id="reg-password" type="password" placeholder="Choose a strong password" value={form.password}
                onChange={e=>setForm({...form,password:e.target.value})} required autoComplete="new-password" minLength={6} />
            </div>
            <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'0.85rem' }} disabled={loading}>
              {loading ? 'Creating account…' : `Create ${role} account →`}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { dashboardAPI, alertAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, ShoppingCart, AlertTriangle, Package, Send } from 'lucide-react';

const COUNTIES = ['Nairobi','Nakuru','Kirinyaga','Kericho','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos'];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcast, setBroadcast] = useState({ county:'Nairobi', type:'drought', message_sw:'', message_en:'' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dashboardAPI.summary()
      .then(r => setSummary(r.data))
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.message_sw) { toast.error('Swahili message required'); return; }
    setSending(true);
    try {
      await alertAPI.broadcast(broadcast);
      toast.success(`Broadcast sent to ${broadcast.county}!`);
      setBroadcast({ ...broadcast, message_sw:'', message_en:'' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  const s = summary || {};

  return (
    <div>
      <div className="page-header">
        <div className="section-label">Admin Panel</div>
        <h2 className="page-title">Platform Overview</h2>
        <p className="page-sub">All sample/pilot data. {s.note}</p>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-label"><Users size={12} style={{verticalAlign:'middle',marginRight:4}}/>Verified Farmers</div>
          <div className="stat-value">{s.farmers_count?.toLocaleString() || 0}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label"><Package size={12} style={{verticalAlign:'middle',marginRight:4}}/>Active Plots</div>
          <div className="stat-value">{s.plots_count || 0}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label"><ShoppingCart size={12} style={{verticalAlign:'middle',marginRight:4}}/>Verified Buyers</div>
          <div className="stat-value">{s.buyers_count || 0}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Yields Matched</div>
          <div className="stat-value">{s.yields_matched || 0}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Total Qty (tonnes)</div>
          <div className="stat-value">{((s.total_qty_kg||0)/1000).toFixed(1)}t</div>
          <div className="stat-note">Confirmed yields</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">M-Pesa Released (KSh)</div>
          <div className="stat-value" style={{ fontSize:'1.4rem' }}>{((s.payments_total_ksh||0)/1000).toFixed(0)}K</div>
          <div className="stat-note">Escrow released</div>
        </div>
      </div>

      {/* Broadcast Alert */}
      <div className="glass-card mt-2" style={{ padding:'1.5rem' }}>
        <h3 style={{ color:'var(--text-primary)', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
          <AlertTriangle size={18} color="var(--amber)"/> Broadcast Alert to County
        </h3>
        <form onSubmit={handleBroadcast}>
          <div className="grid-3" style={{ gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group">
              <label htmlFor="bc-county">Target County</label>
              <select id="bc-county" value={broadcast.county} onChange={e=>setBroadcast({...broadcast,county:e.target.value})}>
                {COUNTIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bc-type">Alert Type</label>
              <select id="bc-type" value={broadcast.type} onChange={e=>setBroadcast({...broadcast,type:e.target.value})}>
                <option value="drought">Drought</option>
                <option value="rain">Rain Warning</option>
                <option value="pest">Pest Alert</option>
                <option value="market">Market Update</option>
                <option value="frost">Frost Warning</option>
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap:'1rem', marginBottom:'1rem' }}>
            <div className="form-group">
              <label htmlFor="bc-sw">Message (Kiswahili) *</label>
              <textarea id="bc-sw" rows={3} placeholder="Taarifa kwa Kiswahili…" value={broadcast.message_sw} onChange={e=>setBroadcast({...broadcast,message_sw:e.target.value})} required style={{ resize:'vertical' }} />
            </div>
            <div className="form-group">
              <label htmlFor="bc-en">Message (English)</label>
              <textarea id="bc-en" rows={3} placeholder="English translation (optional)…" value={broadcast.message_en} onChange={e=>setBroadcast({...broadcast,message_en:e.target.value})} style={{ resize:'vertical' }} />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>
            <Send size={14}/> {sending ? 'Sending…' : `Broadcast to ${broadcast.county}`}
          </button>
          <p style={{ marginTop:'0.5rem', fontSize:'0.78rem', color:'var(--text-muted)' }}>
            In production: integrates Africa's Talking SMS API for live delivery to all farmers in this county.
          </p>
        </form>
      </div>
    </div>
  );
}

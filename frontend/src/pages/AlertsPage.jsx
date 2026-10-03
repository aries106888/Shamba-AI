import React, { useEffect, useState } from 'react';
import { alertAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { CloudLightning, CloudRain, ShoppingCart, Banknote, Bug, AlertTriangle } from 'lucide-react';

const ICONS = {
  drought: <AlertTriangle size={16} color="var(--red)" />,
  rain:    <CloudRain size={16} color="var(--blue)" />,
  market:  <ShoppingCart size={16} color="var(--lime)" />,
  payment: <Banknote size={16} color="#2dd4bf" />,
  pest:    <Bug size={16} color="var(--amber)" />,
  frost:   <CloudLightning size={16} color="#a78bfa" />,
};

const channelBadge = c => {
  const m = { sms:'badge-lime', whatsapp:'badge-amber', ussd:'badge-blue', push:'badge-muted' };
  return <span className={`badge ${m[c]||'badge-muted'}`} style={{fontSize:'0.68rem'}}>{c?.toUpperCase()}</span>;
};

export default function AlertsPage() {
  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang,    setLang]    = useState('sw'); // sw = Swahili, en = English

  useEffect(() => {
    alertAPI.list()
      .then(r => setAlerts(r.data.alerts || []))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="section-label">Alert Centre</div>
          <h2 className="page-title">Farm Alerts</h2>
          <p className="page-sub">SMS, USSD, and WhatsApp alerts delivered in Kiswahili and English.</p>
        </div>
        <div className="flex gap-1">
          <button className={`btn-${lang==='sw'?'primary':'secondary'}`} style={{fontSize:'0.8rem',padding:'0.4rem 0.9rem'}} onClick={()=>setLang('sw')}>
            🇰🇪 Kiswahili
          </button>
          <button className={`btn-${lang==='en'?'primary':'secondary'}`} style={{fontSize:'0.8rem',padding:'0.4rem 0.9rem'}} onClick={()=>setLang('en')}>
            EN English
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No alerts yet</h3>
          <p>Alerts will appear here when weather risks are detected in your county.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {alerts.map(a => (
            <div key={a.id} className={`glass-card alert-${a.type}`} style={{ padding:'1.25rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div style={{ marginTop:2, flexShrink:0 }}>
                {ICONS[a.type] || <AlertTriangle size={16} />}
              </div>
              <div style={{ flex:1 }}>
                <div className="flex items-center gap-1" style={{ marginBottom:'0.4rem', flexWrap:'wrap' }}>
                  <span style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.88rem', textTransform:'capitalize' }}>
                    {a.type} Alert
                  </span>
                  {channelBadge(a.channel)}
                  <span className="badge badge-muted" style={{fontSize:'0.68rem'}}>{a.county || 'Platform-wide'}</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginLeft:'auto' }}>
                    {a.sent_at ? new Date(a.sent_at).toLocaleString('en-KE',{dateStyle:'medium',timeStyle:'short'}) : '—'}
                  </span>
                </div>
                <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.5 }}>
                  {lang === 'sw' ? (a.message_sw || a.message_en) : (a.message_en || a.message_sw)}
                </p>
              </div>
              <span className={`badge ${a.status==='sent'?'badge-lime':'badge-muted'}`} style={{flexShrink:0,fontSize:'0.68rem'}}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* USSD info card */}
      <div className="glass-card mt-2" style={{ padding:'1.5rem', borderLeft:'3px solid var(--amber)' }}>
        <h3 style={{ fontSize:'1rem', color:'var(--text-primary)', marginBottom:'0.75rem' }}>
          📟 Access alerts without internet
        </h3>
        <p style={{ marginBottom:'0.75rem' }}>
          Dial <code>*483*12#</code> (placeholder) on any feature phone to check your farm status in Kiswahili.
        </p>
        <p>
          WhatsApp: <code>+254 700 000 000</code> (placeholder) — send <strong>HABARI</strong> to start.
        </p>
      </div>
    </div>
  );
}

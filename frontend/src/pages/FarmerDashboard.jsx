import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, forecastAPI } from '../api/client';
import { Leaf, CloudRain, Droplets, TrendingUp, AlertTriangle, CheckCircle, Truck, Bell } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const riskBadge = (r) => {
  const map = { low:'badge-lime', moderate:'badge-amber', high:'badge-amber', critical:'badge-red' };
  return <span className={`badge ${map[r]||'badge-muted'}`}>{r}</span>;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => <div key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Demo farmer ID — in production derive from user profile
    const farmerId = 'demo';
    Promise.all([dashboardAPI.summary(), forecastAPI.riskMap()])
      .then(([sumRes, riskRes]) => {
        setData({ summary: sumRes.data, riskMap: riskRes.data.riskMap });
      })
      .catch(() => toast.error('Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const s = data?.summary || {};

  // Mock 7-day chart data
  const chartData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => ({
    day: d,
    rain: +(Math.random()*12).toFixed(1),
    moisture: +(40+Math.random()*50).toFixed(0),
    risk: +(20+Math.random()*65).toFixed(0),
  }));

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="section-label">Farmer Dashboard</div>
          <h2 className="page-title">Shamba lako, ujuzi wako</h2>
          <p className="page-sub">Welcome back — here's your farm intelligence for today.</p>
        </div>
        <div className="flex gap-1">
          <Link to="/farmer/yields" className="btn-secondary" style={{fontSize:'0.82rem',padding:'0.5rem 1rem'}}>
            <CheckCircle size={14}/> Register Yield
          </Link>
          <button className="btn-primary" style={{fontSize:'0.82rem'}} onClick={() => toast.success('Alert preferences saved')}>
            <Bell size={14}/> Alert Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-label">Farmers on Platform</div>
          <div className="stat-value">{s.farmers_count?.toLocaleString() || '—'}</div>
          <div className="stat-change up">↑ Verified farmers</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Active Plots</div>
          <div className="stat-value">{s.plots_count || '—'}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Yields Matched</div>
          <div className="stat-value">{s.yields_matched || '—'}</div>
          <div className="stat-change up">↑ Buyer connections</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">M-Pesa Paid (KSh)</div>
          <div className="stat-value">{s.payments_total_ksh ? `${(s.payments_total_ksh/1000).toFixed(0)}K` : '—'}</div>
          <div className="stat-note">Sample pilot data</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mt-2">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            7-Day Rainfall Forecast (mm)
          </h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(168,214,92,0.05)" />
                <XAxis dataKey="day" tick={{ fill:'#5a7a5a', fontSize:11 }} />
                <YAxis tick={{ fill:'#5a7a5a', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rain" name="Rain mm" stroke="#60a5fa" fill="url(#rainGrad)" strokeWidth={2} dot={{ fill:'#60a5fa', r:3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Dry-Spell Risk Score (0–100)
          </h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(168,214,92,0.05)" />
                <XAxis dataKey="day" tick={{ fill:'#5a7a5a', fontSize:11 }} />
                <YAxis domain={[0,100]} tick={{ fill:'#5a7a5a', fontSize:11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="risk" name="Risk score" stroke="#E8A33D" strokeWidth={2} dot={{ fill:'#E8A33D', r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* County Risk Map summary */}
      <div className="glass-card mt-2" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>County Risk Summary (7-day average)</h3>
          <Link to="/forecasts" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}>
            Full Forecast →
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>County</th><th>Avg Risk Score</th><th>Risk Level</th>
                <th>Avg Rainfall</th><th>Soil Moisture</th>
              </tr>
            </thead>
            <tbody>
              {(data?.riskMap || []).slice(0,10).map(r => (
                <tr key={r.county}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{r.county}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                        <div style={{ width:`${r.avg_risk}%`, height:'100%', borderRadius:3,
                          background: r.avg_risk>70?'var(--red)': r.avg_risk>40?'var(--amber)':'var(--lime)' }}/>
                      </div>
                      <span style={{ fontSize:'0.8rem', minWidth:28 }}>{Math.round(r.avg_risk)}</span>
                    </div>
                  </td>
                  <td>{riskBadge(r.current_risk_level)}</td>
                  <td style={{ color:'var(--blue)' }}>{(+r.avg_rain).toFixed(1)} mm</td>
                  <td style={{ color:'var(--lime)' }}>{(+r.avg_soil_moisture).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

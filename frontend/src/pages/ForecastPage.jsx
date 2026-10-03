import React, { useEffect, useState } from 'react';
import { forecastAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COUNTIES = ['Nairobi','Nakuru','Kirinyaga','Kericho','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Kitui','Mombasa'];
const riskColor = { low:'var(--lime)', moderate:'var(--amber)', high:'#f97316', critical:'var(--red)' };

export default function ForecastPage() {
  const [county,    setCounty]    = useState('Nairobi');
  const [forecasts, setForecasts] = useState([]);
  const [riskMap,   setRiskMap]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([forecastAPI.county(county), forecastAPI.riskMap()])
      .then(([fRes, rRes]) => {
        setForecasts(fRes.data.forecasts || []);
        setRiskMap(rRes.data.riskMap || []);
      })
      .catch(() => toast.error('Failed to load forecasts'))
      .finally(() => setLoading(false));
  }, [county]);

  if (loading) return <LoadingSpinner fullPage />;

  const chartData = forecasts.map(f => ({
    date: new Date(f.date).toLocaleDateString('en-KE',{weekday:'short',month:'short',day:'numeric'}),
    rain: f.rainfall_mm,
    moisture: f.soil_moisture,
    rain_chance: f.rain_chance_pct,
    risk: f.risk_score,
  }));

  const todayForecast = forecasts[0];

  return (
    <div>
      <div className="page-header">
        <div className="section-label">Micro-Climate Intelligence</div>
        <h2 className="page-title">7-Day County Forecast</h2>
        <p className="page-sub">Hyper-local forecasts with uncertainty ranges. Always plan with ±15% margin.</p>
      </div>

      {/* County selector */}
      <div className="flex gap-1 mb-2" style={{ flexWrap:'wrap' }}>
        {COUNTIES.map(c => (
          <button key={c}
            onClick={() => setCounty(c)}
            className={county===c ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize:'0.78rem', padding:'0.4rem 0.9rem' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Today's summary */}
      {todayForecast && (
        <div className="glass-card mb-2" style={{ padding:'1.5rem', borderLeft:`4px solid ${riskColor[todayForecast.dry_spell_risk]||'var(--lime)'}` }}>
          <div className="flex justify-between items-center" style={{ flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <div className="section-label">{county} · Today</div>
              <h3 style={{ fontSize:'1.5rem', color:'var(--text-primary)' }}>
                {todayForecast.min_temp_c}°C – {todayForecast.max_temp_c}°C
              </h3>
              <p style={{ color:'var(--text-secondary)', marginTop:4 }}>{todayForecast.forecast_note}</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', textAlign:'center' }}>
              <div>
                <div style={{ fontSize:'1.4rem', color:'var(--blue)', fontWeight:700 }}>{todayForecast.rainfall_mm}mm</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Rainfall</div>
              </div>
              <div>
                <div style={{ fontSize:'1.4rem', color:'var(--lime)', fontWeight:700 }}>{todayForecast.soil_moisture}%</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Soil Moisture</div>
              </div>
              <div>
                <div style={{ fontSize:'1.4rem', color: riskColor[todayForecast.dry_spell_risk], fontWeight:700 }}>
                  {todayForecast.risk_score}
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Risk Score</div>
              </div>
            </div>
            <div>
              <span className={`badge ${todayForecast.dry_spell_risk==='low'?'badge-lime':todayForecast.dry_spell_risk==='moderate'?'badge-amber':'badge-red'}`}
                style={{ fontSize:'0.9rem', padding:'6px 16px' }}>
                {todayForecast.dry_spell_risk?.toUpperCase()} RISK
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid-2 mt-2">
        <div className="glass-card" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'1rem' }}>Rainfall & Rain Chance</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(168,214,92,0.05)" />
                <XAxis dataKey="date" tick={{ fill:'#5a7a5a', fontSize:9 }} />
                <YAxis tick={{ fill:'#5a7a5a', fontSize:9 }} />
                <Tooltip contentStyle={{ background:'var(--bg-mid)', border:'1px solid var(--border-glass)', borderRadius:8, fontSize:11 }} />
                <Area type="monotone" dataKey="rain" name="Rain mm" stroke="#60a5fa" fill="url(#rg)" strokeWidth={2} />
                <Area type="monotone" dataKey="rain_chance" name="Chance %" stroke="#A8D65C" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding:'1.5rem' }}>
          <h3 style={{ fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'1rem' }}>Dry-Spell Risk Score & Soil Moisture</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#E8A33D" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#E8A33D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(168,214,92,0.05)" />
                <XAxis dataKey="date" tick={{ fill:'#5a7a5a', fontSize:9 }} />
                <YAxis tick={{ fill:'#5a7a5a', fontSize:9 }} />
                <Tooltip contentStyle={{ background:'var(--bg-mid)', border:'1px solid var(--border-glass)', borderRadius:8, fontSize:11 }} />
                <Area type="monotone" dataKey="risk" name="Risk score" stroke="#E8A33D" fill="url(#rsg)" strokeWidth={2} />
                <Area type="monotone" dataKey="moisture" name="Soil %" stroke="#A8D65C" fill="none" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7-day table */}
      <div className="glass-card mt-2" style={{ padding:'1.5rem' }}>
        <h3 style={{ fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'1rem' }}>7-Day Detail — {county}</h3>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Temp °C</th><th>Rain mm</th><th>Humidity</th><th>Wind km/h</th><th>Rain Chance</th><th>Risk Level</th><th>Risk Score</th></tr>
            </thead>
            <tbody>
              {forecasts.map(f => (
                <tr key={f.id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>
                    {new Date(f.date).toLocaleDateString('en-KE',{weekday:'short',month:'short',day:'numeric'})}
                  </td>
                  <td>{f.min_temp_c}–{f.max_temp_c}</td>
                  <td style={{ color:'var(--blue)' }}>{f.rainfall_mm} mm</td>
                  <td>{f.humidity_pct}%</td>
                  <td>{f.wind_kmh} km/h</td>
                  <td>{f.rain_chance_pct}%</td>
                  <td><span className={`badge ${f.dry_spell_risk==='low'?'badge-lime':f.dry_spell_risk==='moderate'?'badge-amber':'badge-red'}`}>{f.dry_spell_risk}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:60, height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                        <div style={{ width:`${f.risk_score}%`, height:'100%', borderRadius:3, background: riskColor[f.dry_spell_risk] }}/>
                      </div>
                      <span style={{ fontSize:'0.8rem', color: riskColor[f.dry_spell_risk] }}>{f.risk_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All-county risk map table */}
      <div className="glass-card mt-2" style={{ padding:'1.5rem' }}>
        <h3 style={{ fontSize:'0.95rem', color:'var(--text-primary)', marginBottom:'1rem' }}>All-County Risk Overview</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:'0.75rem' }}>
          {riskMap.map(r => (
            <div key={r.county} className="glass-card" style={{ padding:'1rem', textAlign:'center', borderLeft:`3px solid ${riskColor[r.current_risk_level]||'var(--lime)'}` }}>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>{r.county}</div>
              <div style={{ fontSize:'1.6rem', fontWeight:700, color: riskColor[r.current_risk_level] }}>{Math.round(r.avg_risk)}</div>
              <div style={{ fontSize:'0.7rem', color: riskColor[r.current_risk_level], textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {r.current_risk_level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

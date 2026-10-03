import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceAPI } from '../api/client';
import { dashboardAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BarChart2, Truck, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const statusBadge = (s) => {
  const m = { proposed:'badge-amber', accepted:'badge-lime', rejected:'badge-red', fulfilled:'badge-blue' };
  return <span className={`badge ${m[s]||'badge-muted'}`}>{s}</span>;
};

export default function BuyerDashboard() {
  const [summary,  setSummary]  = useState(null);
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.summary(), marketplaceAPI.listings()])
      .then(([sRes, lRes]) => {
        setSummary(sRes.data);
        setListings(lRes.data.listings || []);
      })
      .catch(() => toast.error('Failed to load buyer dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const byCounty = listings.reduce((acc, l) => {
    acc[l.county] = (acc[l.county] || 0) + (l.confirmed_qty_kg || l.expected_qty_kg || 0);
    return acc;
  }, {});
  const countyChart = Object.entries(byCounty).slice(0,8).map(([county, qty]) => ({ county, qty: Math.round(qty/1000) }));

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="section-label">Buyer Dashboard</div>
          <h2 className="page-title">Your Procurement Hub</h2>
          <p className="page-sub">Browse verified Kenyan farm yields, match with farmers, track deliveries.</p>
        </div>
        <Link to="/marketplace" className="btn-primary">Browse Marketplace →</Link>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-label">Available Listings</div>
          <div className="stat-value">{listings.length}</div>
          <div className="stat-note">Live from marketplace</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Total Available (tonnes)</div>
          <div className="stat-value">{(listings.reduce((a,l) => a+(l.confirmed_qty_kg||l.expected_qty_kg||0),0)/1000).toFixed(1)}t</div>
          <div className="stat-note">Across all counties</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Counties Covered</div>
          <div className="stat-value">{Object.keys(byCounty).length}</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-label">Verified Farmers</div>
          <div className="stat-value">{summary?.farmers_count || '—'}</div>
          <div className="stat-note">Platform-wide</div>
        </div>
      </div>

      <div className="grid-2 mt-2">
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize:'1rem', color:'var(--text-primary)', marginBottom:'1rem' }}>
            Available Tonnage by County (tonnes)
          </h3>
          <div className="chart-wrap" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countyChart} layout="vertical">
                <CartesianGrid stroke="rgba(168,214,92,0.05)" />
                <XAxis type="number" tick={{ fill:'#5a7a5a', fontSize:10 }} />
                <YAxis type="category" dataKey="county" width={80} tick={{ fill:'#5a7a5a', fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--bg-mid)', border:'1px solid var(--border-glass)', borderRadius:8 }} />
                <Bar dataKey="qty" name="Tonnes" fill="#A8D65C" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize:'1rem', color:'var(--text-primary)', marginBottom:'1rem' }}>Recent Listings</h3>
          <table className="data-table">
            <thead>
              <tr><th>Crop</th><th>County</th><th>Qty</th><th>KSh/kg</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {listings.slice(0,6).map(l => (
                <tr key={l.id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{l.crop}</td>
                  <td>{l.county}</td>
                  <td style={{ color:'var(--lime)' }}>{((l.confirmed_qty_kg||l.expected_qty_kg||0)/1000).toFixed(1)}t</td>
                  <td style={{ color:'var(--amber)' }}>KSh {l.price_ksh_kg}</td>
                  <td><span className="badge badge-lime">{l.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/marketplace" className="btn-secondary mt-2" style={{ width:'100%', justifyContent:'center', fontSize:'0.82rem' }}>
            View All Listings →
          </Link>
        </div>
      </div>
    </div>
  );
}

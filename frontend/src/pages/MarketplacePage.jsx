import React, { useEffect, useState } from 'react';
import { marketplaceAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, Filter } from 'lucide-react';

const CROPS = ['All','Maize','Wheat','Irish Potatoes','Tomatoes','Onions','Sukuma Wiki','Avocados','Beans','Tea','Coffee'];
const COUNTIES = ['All','Nairobi','Nakuru','Kirinyaga','Kericho','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Nyandarua','Murang\'a','Kajiado'];
const EMOJI = { Maize:'🌽', Wheat:'🌾', 'Irish Potatoes':'🥔', Tomatoes:'🍅', Onions:'🧅', 'Sukuma Wiki':'🥬', Avocados:'🥑', Beans:'🫘', Tea:'🍃', Coffee:'☕' };

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [crop,     setCrop]     = useState('All');
  const [county,   setCounty]   = useState('All');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    marketplaceAPI.listings({
      ...(crop !== 'All'   && { crop }),
      ...(county !== 'All' && { county }),
    })
      .then(r => setListings(r.data.listings || []))
      .catch(() => toast.error('Failed to load marketplace'))
      .finally(() => setLoading(false));
  }, [crop, county]);

  const filtered = listings.filter(l =>
    !search || l.crop.toLowerCase().includes(search.toLowerCase()) || l.county?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequest = (id, crop) => {
    toast.success(`Quote request sent for ${crop}!\nOur team will connect you with the farmer.`);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <div className="section-label">B2B Buyer Marketplace</div>
        <h2 className="page-title">Kenya's Freshest Farm Produce</h2>
        <p className="page-sub">All yields are from verified farmers. Prices are indicative — M-Pesa escrow on delivery.</p>
      </div>

      {/* Filters */}
      <div className="glass-card mb-2" style={{ padding:'1rem 1.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input placeholder="Search crop or county…" value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'2.2rem' }} />
        </div>
        <select value={crop} onChange={e=>setCrop(e.target.value)} style={{ minWidth:140 }}>
          {CROPS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={county} onChange={e=>setCounty(e.target.value)} style={{ minWidth:140 }}>
          {COUNTIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{filtered.length} listing{filtered.length!==1?'s':''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌱</div>
          <h3>No listings found</h3>
          <p>Try adjusting your filters or check back after harvest season.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px, 1fr))', gap:'1rem' }}>
          {filtered.map(l => (
            <div key={l.id} className="glass-card" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <span className={`badge ${l.grade==='AA'?'badge-lime':l.grade==='A'?'badge-lime':'badge-amber'}`}>{l.grade || 'B'}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                  {l.harvest_date ? new Date(l.harvest_date).toLocaleDateString('en-KE',{month:'short',day:'numeric'}) : 'TBD'}
                </span>
              </div>
              <div style={{ fontSize:'3rem', textAlign:'center' }}>{EMOJI[l.crop] || '🌿'}</div>
              <h3 style={{ textAlign:'center', fontSize:'1.1rem', color:'var(--text-primary)' }}>{l.crop}</h3>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', textAlign:'center' }}>📍 {l.county || l.farmer_county}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                Available: <strong style={{ color:'var(--text-primary)' }}>
                  {((l.confirmed_qty_kg||l.expected_qty_kg||0)/1000).toFixed(1)} tonnes
                </strong>
              </div>
              <div style={{ fontSize:'1.3rem', fontWeight:700, fontFamily:'var(--font-serif)', color:'var(--lime)' }}>
                KSh {l.price_ksh_kg}<span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:400 }}>/kg</span>
              </div>
              {l.farmer_name && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>Farmer: {l.farmer_name}</div>}
              <button className="btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:'0.82rem' }}
                onClick={() => handleRequest(l.id, l.crop)}>
                Request Quote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

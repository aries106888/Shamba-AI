import React, { useEffect, useState, useCallback } from 'react';
import {
  MapContainer, TileLayer, Polygon, Marker, Popup,
  LayersControl, Circle, Tooltip as MapTooltip, useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { Eye, Satellite, Layers, MapPin, Leaf, AlertTriangle, Droplets, RefreshCw } from 'lucide-react';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Config ────────────────────────────────────────────────────
const GEO_URL = 'http://localhost:5001';

// NDVI → colour
const ndviColor = (score) => {
  if (score >= 0.75) return '#22c55e'; // excellent — vivid green
  if (score >= 0.55) return '#A8D65C'; // good — lime
  if (score >= 0.35) return '#E8A33D'; // fair — amber
  return '#D9534F';                    // poor  — red
};

// Risk → fill opacity
const riskOpacity = (score) => 0.15 + (score / 100) * 0.45;

// ─── Custom pin icons ────────────────────────────────────────────
const createIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:18px;height:18px;border-radius:50% 50% 50% 0;
    background:${color};border:2px solid rgba(255,255,255,0.8);
    transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.5)">
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

// ─── Satellite tile layers ──────────────────────────────────────
const TILES = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, Maxar, GeoEye, Earthstar Geographics',
    name: '🛰️ Satellite (Eye of God)',
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
    name: '🗺️ Satellite + Labels',
    overlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  },
  topo: {
    url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data © OpenTopoMap contributors',
    name: '🏔️ Topographic',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© CartoDB',
    name: '🌑 Dark',
  },
};

// ─── Auto-fly to Kenya ──────────────────────────────────────────
function FlyToKenya() {
  const map = useMap();
  useEffect(() => {
    map.setView([0.0236, 37.9062], 6);
  }, [map]);
  return null;
}

// ─── Main Component ─────────────────────────────────────────────
export default function FarmMapPage() {
  const [plots,        setPlots]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [tileMode,     setTileMode]     = useState('satellite');
  const [ndviMode,     setNdviMode]     = useState(true);
  const [riskMode,     setRiskMode]     = useState(false);
  const [geoOnline,    setGeoOnline]    = useState(false);
  const [filterCounty, setFilterCounty] = useState('All');
  const [filterHealth, setFilterHealth] = useState('All');

  const fetchPlots = useCallback(() => {
    setLoading(true);
    fetch(`${GEO_URL}/geo/plots`)
      .then(r => r.json())
      .then(r => {
        setPlots(r.data?.plots || []);
        setGeoOnline(true);
        toast.success('Satellite farm data loaded via Go microservice');
      })
      .catch(() => {
        setGeoOnline(false);
        // Fallback demo data so the map works without the Go service
        setPlots([
          { id:'plot-001', name:'Wanjiru Farm – Maize', farmerID:'f1', county:'Kirinyaga', crop:'Maize',
            polygon:[{lat:-0.628,lng:37.376},{lat:-0.624,lng:37.376},{lat:-0.624,lng:37.382},{lat:-0.628,lng:37.382}],
            centroid:{lat:-0.626,lng:37.379}, area_ha:1.2, ndvi_score:0.72, health:'good', risk_score:32 },
          { id:'plot-002', name:'Wanjiru Beans', farmerID:'f1', county:'Kirinyaga', crop:'Beans',
            polygon:[{lat:-0.622,lng:37.376},{lat:-0.619,lng:37.376},{lat:-0.619,lng:37.381},{lat:-0.622,lng:37.381}],
            centroid:{lat:-0.6205,lng:37.3785}, area_ha:0.9, ndvi_score:0.58, health:'fair', risk_score:55 },
          { id:'plot-003', name:'Kipchoge Tea Block', farmerID:'f2', county:'Kericho', crop:'Tea',
            polygon:[{lat:-0.372,lng:35.278},{lat:-0.368,lng:35.278},{lat:-0.368,lng:35.284},{lat:-0.372,lng:35.284}],
            centroid:{lat:-0.370,lng:35.281}, area_ha:2.0, ndvi_score:0.85, health:'excellent', risk_score:14 },
          { id:'plot-004', name:'Amina Tomatoes – Garissa', farmerID:'f3', county:'Garissa', crop:'Tomatoes',
            polygon:[{lat:-0.458,lng:39.643},{lat:-0.454,lng:39.643},{lat:-0.454,lng:39.649},{lat:-0.458,lng:39.649}],
            centroid:{lat:-0.456,lng:39.646}, area_ha:1.2, ndvi_score:0.44, health:'fair', risk_score:72 },
          { id:'plot-005', name:'Nakuru Wheat', farmerID:'f4', county:'Nakuru', crop:'Wheat',
            polygon:[{lat:-0.282,lng:36.062},{lat:-0.276,lng:36.062},{lat:-0.276,lng:36.070},{lat:-0.282,lng:36.070}],
            centroid:{lat:-0.279,lng:36.066}, area_ha:3.5, ndvi_score:0.79, health:'good', risk_score:28 },
          { id:'plot-006', name:'Kitui Drought Zone', farmerID:'f5', county:'Kitui', crop:'Sorghum',
            polygon:[{lat:-1.367,lng:38.008},{lat:-1.362,lng:38.008},{lat:-1.362,lng:38.014},{lat:-1.367,lng:38.014}],
            centroid:{lat:-1.3645,lng:38.011}, area_ha:1.8, ndvi_score:0.31, health:'poor', risk_score:88 },
        ]);
        toast('Using demo data — start Go service for live geo tracking', { icon:'📡' });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);

  const counties = ['All', ...new Set(plots.map(p => p.county))];
  const filtered = plots.filter(p =>
    (filterCounty === 'All' || p.county === filterCounty) &&
    (filterHealth === 'All' || p.health === filterHealth)
  );

  const tile = TILES[tileMode];
  const polygonPositions = (p) => p.polygon.map(pt => [pt.lat, pt.lng]);
  const centroid = (p) => [p.centroid.lat, p.centroid.lng];

  const healthBadge = (h) => {
    const m = { excellent:'badge-lime', good:'badge-lime', fair:'badge-amber', poor:'badge-red' };
    return <span className={`badge ${m[h]||'badge-muted'}`}>{h}</span>;
  };

  const stats = {
    total:     filtered.length,
    excellent: filtered.filter(p => p.health === 'excellent').length,
    atRisk:    filtered.filter(p => p.risk_score >= 60).length,
    totalHa:   filtered.reduce((a,p) => a + (p.area_ha||0), 0).toFixed(1),
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 60px)', gap:0 }}>

      {/* ── Top controls ────────────────────────────────────── */}
      <div style={{
        padding:'0.9rem 1.5rem', background:'rgba(6,21,15,0.95)',
        borderBottom:'1px solid var(--border-glass)', display:'flex',
        alignItems:'center', gap:'1rem', flexWrap:'wrap', zIndex:500, flexShrink:0,
      }}>
        <div>
          <div className="section-label" style={{ marginBottom:0 }}>AERIAL FARM TRACKING</div>
          <h2 style={{ fontSize:'1.1rem', color:'var(--text-primary)', lineHeight:1 }}>
            Eye of God — Satellite View
          </h2>
        </div>

        {/* Tile switcher */}
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
          {Object.entries(TILES).map(([key, t]) => (
            <button key={key}
              className={tileMode === key ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}
              onClick={() => setTileMode(key)}>
              {t.name}
            </button>
          ))}
        </div>

        {/* Overlay toggles */}
        <div style={{ display:'flex', gap:'0.4rem' }}>
          <button
            className={ndviMode ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem' }}
            onClick={() => setNdviMode(v => !v)}>
            <Leaf size={11}/> NDVI Health
          </button>
          <button
            className={riskMode ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem', background: riskMode ? 'var(--amber)' : undefined, color: riskMode ? '#06150F' : undefined }}
            onClick={() => setRiskMode(v => !v)}>
            <AlertTriangle size={11}/> Risk Overlay
          </button>
        </div>

        {/* County filter */}
        <select value={filterCounty} onChange={e => setFilterCounty(e.target.value)}
          style={{ fontSize:'0.78rem', padding:'0.35rem 0.75rem', minWidth:120 }}>
          {counties.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Health filter */}
        <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}
          style={{ fontSize:'0.78rem', padding:'0.35rem 0.75rem', minWidth:110 }}>
          {['All','excellent','good','fair','poor'].map(h => <option key={h}>{h}</option>)}
        </select>

        <button className="btn-secondary" style={{ fontSize:'0.72rem', padding:'0.35rem 0.75rem', marginLeft:'auto' }}
          onClick={fetchPlots}>
          <RefreshCw size={12}/> Refresh
        </button>

        <div style={{ fontSize:'0.72rem', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background: geoOnline ? 'var(--lime)' : 'var(--amber)', animation:'pulse 2s infinite' }} />
          Go Geo {geoOnline ? 'Online' : 'Demo'}
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── Sidebar ─────────────────────────────────────── */}
        <div style={{
          width:260, background:'rgba(6,21,15,0.97)', borderRight:'1px solid var(--border-glass)',
          overflowY:'auto', flexShrink:0, padding:'1rem',
        }}>
          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem' }}>
            {[
              ['Plots', stats.total, 'var(--lime)'],
              ['Hectares', stats.totalHa, 'var(--blue)'],
              ['Healthy', stats.excellent, 'var(--lime)'],
              ['At Risk', stats.atRisk, 'var(--red)'],
            ].map(([l,v,c]) => (
              <div key={l} className="glass-card" style={{ padding:'0.6rem', textAlign:'center' }}>
                <div style={{ fontSize:'1.2rem', fontWeight:700, color:c, fontFamily:'var(--font-serif)' }}>{v}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginBottom:'1rem', fontSize:'0.75rem' }}>
            <div style={{ color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem', fontSize:'0.68rem' }}>NDVI Crop Health</div>
            {[['≥0.75 Excellent','#22c55e'],['≥0.55 Good','#A8D65C'],['≥0.35 Fair','#E8A33D'],['<0.35 Poor','#D9534F']].map(([l,c])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <div style={{ width:12, height:12, borderRadius:2, background:c, flexShrink:0 }} />
                <span style={{ color:'var(--text-secondary)' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Plot list */}
          <div style={{ color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', fontSize:'0.68rem', marginBottom:'0.5rem' }}>
            Farm Plots ({filtered.length})
          </div>
          {loading ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-muted)' }}>
              <div className="spinner sm" style={{ margin:'0 auto' }} />
            </div>
          ) : filtered.map(p => (
            <div key={p.id}
              onClick={() => setSelectedPlot(p)}
              style={{
                padding:'0.75rem', borderRadius:10, marginBottom:'0.5rem', cursor:'pointer',
                background: selectedPlot?.id === p.id ? 'rgba(168,214,92,0.12)' : 'rgba(0,0,0,0.15)',
                border:`1px solid ${selectedPlot?.id === p.id ? 'var(--border-strong)' : 'var(--border-glass)'}`,
                transition:'all 0.2s',
              }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:ndviColor(p.ndvi_score), flexShrink:0 }} />
                <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-primary)', lineHeight:1.2 }}>{p.name}</span>
              </div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>
                📍 {p.county} · {p.crop}
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                {healthBadge(p.health)}
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{p.area_ha} ha</span>
                {p.risk_score >= 60 && <span style={{ fontSize:'0.68rem', color:'var(--red)' }}>⚠ High Risk</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ── Map ─────────────────────────────────────────── */}
        <div style={{ flex:1, position:'relative' }}>
          <MapContainer
            center={[0.0236, 37.9062]}
            zoom={6}
            style={{ width:'100%', height:'100%' }}
            zoomControl={true}
          >
            <FlyToKenya />

            {/* Base tile layer */}
            <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={20} />
            {tileMode === 'hybrid' && tile.overlay && (
              <TileLayer url={tile.overlay} attribution="" opacity={0.7} />
            )}

            {/* Farm plot polygons */}
            {filtered.map(p => {
              const fillColor = ndviMode
                ? ndviColor(p.ndvi_score)
                : riskMode
                  ? (p.risk_score >= 70 ? '#D9534F' : p.risk_score >= 40 ? '#E8A33D' : '#A8D65C')
                  : '#A8D65C';

              const opacity = riskMode ? riskOpacity(p.risk_score) : 0.35;

              return (
                <Polygon
                  key={p.id}
                  positions={polygonPositions(p)}
                  pathOptions={{
                    color: fillColor,
                    fillColor: fillColor,
                    fillOpacity: opacity,
                    weight: selectedPlot?.id === p.id ? 3 : 1.5,
                    dashArray: p.health === 'poor' ? '6,4' : null,
                  }}
                  eventHandlers={{ click: () => setSelectedPlot(p) }}>
                  <MapTooltip sticky>
                    <div style={{ fontFamily:'var(--font-sans)', fontSize:'12px', lineHeight:1.5 }}>
                      <strong>{p.name}</strong><br/>
                      {p.crop} · {p.county}<br/>
                      NDVI: {p.ndvi_score} · Health: {p.health}<br/>
                      Risk: {p.risk_score}/100 · {p.area_ha} ha
                    </div>
                  </MapTooltip>
                  <Popup>
                    <div style={{ fontFamily:'sans-serif', minWidth:180, fontSize:'12px' }}>
                      <strong style={{ fontSize:'13px' }}>{p.name}</strong>
                      <div style={{ color:'#5a7a5a', marginTop:2 }}>📍 {p.county} County</div>
                      <hr style={{ border:'none', borderTop:'1px solid #1e4d2b', margin:'6px 0' }}/>
                      <div>🌿 Crop: <strong>{p.crop}</strong></div>
                      <div>📐 Area: <strong>{p.area_ha} ha</strong></div>
                      <div>🛰️ NDVI: <strong>{p.ndvi_score}</strong> ({p.health})</div>
                      <div>⚠️ Risk: <strong>{p.risk_score}/100</strong></div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Centroid markers */}
            {filtered.map(p => (
              <Marker
                key={`m-${p.id}`}
                position={centroid(p)}
                icon={createIcon(ndviColor(p.ndvi_score))}
                eventHandlers={{ click: () => setSelectedPlot(p) }}
              />
            ))}

            {/* Risk circles (when risk mode on) */}
            {riskMode && filtered.filter(p => p.risk_score >= 60).map(p => (
              <Circle
                key={`c-${p.id}`}
                center={centroid(p)}
                radius={800}
                pathOptions={{ color:'#D9534F', fillColor:'#D9534F', fillOpacity:0.08, weight:1, dashArray:'4,4' }}
              />
            ))}
          </MapContainer>

          {/* ── Selected plot detail card ────────────────── */}
          {selectedPlot && (
            <div style={{
              position:'absolute', bottom:16, right:16, zIndex:1000,
              background:'rgba(6,21,15,0.96)', border:'1px solid var(--border-strong)',
              borderRadius:20, padding:'1.25rem', width:280,
              backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                <h3 style={{ fontSize:'0.95rem', color:'var(--text-primary)', lineHeight:1.3, maxWidth:200 }}>{selectedPlot.name}</h3>
                <button onClick={() => setSelectedPlot(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>✕</button>
              </div>

              <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.75rem' }}>
                📍 {selectedPlot.county} · {selectedPlot.crop}
              </div>

              {/* NDVI bar */}
              <div style={{ marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:4 }}>
                  <span style={{ color:'var(--text-secondary)' }}>🛰️ NDVI Score</span>
                  <span style={{ color:ndviColor(selectedPlot.ndvi_score), fontWeight:700 }}>{selectedPlot.ndvi_score}</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                  <div style={{ width:`${selectedPlot.ndvi_score*100}%`, height:'100%', borderRadius:3, background:ndviColor(selectedPlot.ndvi_score), transition:'width 0.5s ease' }}/>
                </div>
              </div>

              {/* Risk bar */}
              <div style={{ marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:4 }}>
                  <span style={{ color:'var(--text-secondary)' }}>⚠️ Dry-Spell Risk</span>
                  <span style={{ color: selectedPlot.risk_score >= 70 ? 'var(--red)' : selectedPlot.risk_score >= 40 ? 'var(--amber)' : 'var(--lime)', fontWeight:700 }}>
                    {selectedPlot.risk_score}/100
                  </span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                  <div style={{ width:`${selectedPlot.risk_score}%`, height:'100%', borderRadius:3,
                    background: selectedPlot.risk_score >= 70 ? 'var(--red)' : selectedPlot.risk_score >= 40 ? 'var(--amber)' : 'var(--lime)',
                    transition:'width 0.5s ease' }}/>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', fontSize:'0.78rem' }}>
                <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'0.5rem', textAlign:'center' }}>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem', marginBottom:2 }}>AREA</div>
                  <div style={{ color:'var(--blue)', fontWeight:700 }}>{selectedPlot.area_ha} ha</div>
                </div>
                <div style={{ background:'rgba(0,0,0,0.2)', borderRadius:8, padding:'0.5rem', textAlign:'center' }}>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem', marginBottom:2 }}>HEALTH</div>
                  {healthBadge(selectedPlot.health)}
                </div>
              </div>

              <div style={{ marginTop:'0.75rem', fontSize:'0.72rem', color:'var(--text-muted)', textAlign:'center', fontStyle:'italic' }}>
                Satellite imagery: Esri World Imagery<br/>
                NDVI: Simulated (Sentinel-2 in production)
              </div>
            </div>
          )}

          {/* ── Coordinates HUD ─────────────────────────── */}
          <div style={{
            position:'absolute', bottom:16, left:16, zIndex:1000,
            background:'rgba(6,21,15,0.88)', border:'1px solid var(--border-glass)',
            borderRadius:10, padding:'0.5rem 0.9rem', fontSize:'0.72rem', color:'var(--text-muted)',
            backdropFilter:'blur(10px)',
          }}>
            🛰️ Eye of God · Sentinel-2 NDVI overlay · Kenya Farm Boundaries
          </div>
        </div>
      </div>
    </div>
  );
}

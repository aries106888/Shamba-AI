import React, { useState } from 'react';
import { yieldAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const COUNTIES = ['Nairobi','Nakuru','Kirinyaga','Kericho','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Kitui','Mombasa','Nyandarua','Murang\'a','Kajiado','Laikipia'];
const CROPS    = ['Maize','Wheat','Irish Potatoes','Tomatoes','Onions','Sukuma Wiki','Avocados','Beans','Tea','Coffee','Sorghum','Millet','Cassava'];

export default function YieldRegistryPage() {
  const [yields,  setYields]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showing, setShowing] = useState(false);
  const [form,    setForm]    = useState({ farmer_id:'', crop:'Maize', county:'Nairobi', expected_qty_kg:'', harvest_date:'', grade:'A', price_ksh_kg:'' });
  const [submitting, setSubmitting] = useState(false);

  const loadYields = () => {
    yieldAPI.list()
      .then(r => setYields(r.data.yields || []))
      .catch(() => toast.error('Failed to load yields'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadYields(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farmer_id || !form.expected_qty_kg) {
      toast.error('Farmer ID and expected quantity are required');
      return;
    }
    setSubmitting(true);
    try {
      await yieldAPI.create({ ...form, expected_qty_kg: parseFloat(form.expected_qty_kg), price_ksh_kg: parseFloat(form.price_ksh_kg)||null });
      toast.success('Yield registered successfully! Asante.');
      setShowing(false);
      setForm({ farmer_id:'', crop:'Maize', county:'Nairobi', expected_qty_kg:'', harvest_date:'', grade:'A', price_ksh_kg:'' });
      loadYields();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = s => {
    const m = { pending:'badge-amber', confirmed:'badge-lime', matched:'badge-blue', delivered:'badge-muted' };
    return <span className={`badge ${m[s]||'badge-muted'}`}>{s}</span>;
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div>
          <div className="section-label">Yield Registry</div>
          <h2 className="page-title">Register Your Harvest</h2>
          <p className="page-sub">Confirm expected yields so buyers can plan procurement in advance.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowing(!showing)}>
          <Plus size={16}/> Register Yield
        </button>
      </div>

      {/* Registration form */}
      {showing && (
        <div className="glass-card mb-2" style={{ padding:'1.5rem' }}>
          <h3 style={{ color:'var(--text-primary)', marginBottom:'1rem' }}>New Yield Registration</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-3" style={{ gap:'1rem' }}>
              <div className="form-group">
                <label htmlFor="yr-farmer">Farmer ID</label>
                <input id="yr-farmer" placeholder="Your farmer ID" value={form.farmer_id} onChange={e=>setForm({...form,farmer_id:e.target.value})} required />
              </div>
              <div className="form-group">
                <label htmlFor="yr-crop">Crop</label>
                <select id="yr-crop" value={form.crop} onChange={e=>setForm({...form,crop:e.target.value})}>
                  {CROPS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="yr-county">County</label>
                <select id="yr-county" value={form.county} onChange={e=>setForm({...form,county:e.target.value})}>
                  {COUNTIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="yr-qty">Expected Quantity (kg)</label>
                <input id="yr-qty" type="number" min="1" placeholder="e.g. 2500" value={form.expected_qty_kg} onChange={e=>setForm({...form,expected_qty_kg:e.target.value})} required />
              </div>
              <div className="form-group">
                <label htmlFor="yr-date">Estimated Harvest Date</label>
                <input id="yr-date" type="date" value={form.harvest_date} onChange={e=>setForm({...form,harvest_date:e.target.value})} />
              </div>
              <div className="form-group">
                <label htmlFor="yr-grade">Quality Grade</label>
                <select id="yr-grade" value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>
                  <option>AA</option><option>A</option><option>B</option><option>C</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="yr-price">Asking Price (KSh/kg)</label>
                <input id="yr-price" type="number" min="1" placeholder="e.g. 38" value={form.price_ksh_kg} onChange={e=>setForm({...form,price_ksh_kg:e.target.value})} />
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Registering…' : <><CheckCircle size={14}/> Register Yield</>}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Yield table */}
      <div className="glass-card" style={{ padding:'1.5rem', overflowX:'auto' }}>
        {yields.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h3>No yields registered yet</h3>
            <p>Register your first yield to start connecting with buyers.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th><th>County</th><th>Farmer</th><th>Expected (kg)</th>
                <th>Confirmed (kg)</th><th>Harvest Date</th><th>Grade</th>
                <th>KSh/kg</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {yields.map(y => (
                <tr key={y.id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:600 }}>{y.crop}</td>
                  <td>{y.county}</td>
                  <td style={{ fontSize:'0.82rem' }}>{y.farmer_name || '—'}</td>
                  <td style={{ color:'var(--lime)' }}>{(+y.expected_qty_kg).toLocaleString()}</td>
                  <td style={{ color: y.confirmed_qty_kg ? 'var(--teal)':'var(--text-muted)' }}>
                    {y.confirmed_qty_kg ? (+y.confirmed_qty_kg).toLocaleString() : '—'}
                  </td>
                  <td style={{ fontSize:'0.82rem' }}>{y.harvest_date || '—'}</td>
                  <td><span className={`badge ${y.grade==='AA'||y.grade==='A'?'badge-lime':'badge-amber'}`}>{y.grade||'—'}</span></td>
                  <td style={{ color:'var(--amber)' }}>{y.price_ksh_kg ? `KSh ${y.price_ksh_kg}` : '—'}</td>
                  <td>{statusBadge(y.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

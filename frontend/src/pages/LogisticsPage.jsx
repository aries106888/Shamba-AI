import React, { useEffect, useState } from 'react';
import { logisticsAPI } from '../api/client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

const statusColor = { booked:'var(--amber)', in_transit:'var(--blue)', delivered:'var(--lime)', cancelled:'var(--red)' };
const statusIcon  = { booked:<Clock size={14}/>, in_transit:<Truck size={14}/>, delivered:<CheckCircle size={14}/>, cancelled:'✕' };

export default function LogisticsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    logisticsAPI.list()
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => toast.error('Failed to load logistics'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await logisticsAPI.updateStatus(id, status);
      toast.success(res.data.message);
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
    } catch {
      toast.error('Status update failed');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <div className="section-label">Logistics & Delivery</div>
        <h2 className="page-title">Track Your Shipments</h2>
        <p className="page-sub">M-Pesa escrow is released automatically on confirmed delivery.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Truck size={48} color="var(--text-muted)"/></div>
          <h3>No bookings yet</h3>
          <p>Logistics bookings appear here once a yield match is accepted.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-card" style={{ padding:'1.5rem' }}>
              <div className="flex justify-between items-center" style={{ flexWrap:'wrap', gap:'1rem', marginBottom:'1rem' }}>
                <div>
                  <h3 style={{ color:'var(--text-primary)', fontSize:'1rem' }}>
                    {b.crop || 'Produce'} · {b.qty_kg?.toLocaleString()} kg
                  </h3>
                  <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:2 }}>
                    {b.buyer_name} · Booking {b.id.slice(0,8)}
                  </div>
                </div>
                <span className="badge" style={{ background:`${statusColor[b.status]}22`, color:statusColor[b.status], border:`1px solid ${statusColor[b.status]}44`, fontSize:'0.78rem', padding:'5px 14px' }}>
                  {statusIcon[b.status]} {b.status?.replace('_',' ').toUpperCase()}
                </span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:'1rem', fontSize:'0.85rem' }}>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>PICKUP</div><MapPin size={12} style={{verticalAlign:'middle',marginRight:4,color:'var(--lime)'}}/>{b.pickup_county}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>DELIVERY</div><MapPin size={12} style={{verticalAlign:'middle',marginRight:4,color:'var(--amber)'}}/>{b.delivery_county}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>PICKUP DATE</div>{b.pickup_date || '—'}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>DRIVER</div>{b.driver_name || '—'}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>TRUCK</div>{b.truck_reg || '—'}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>DISTANCE</div>{b.distance_km ? `${b.distance_km} km` : '—'}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>COST</div>{b.cost_ksh ? `KSh ${(+b.cost_ksh).toLocaleString()}` : '—'}</div>
                <div><div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginBottom:2 }}>VALUE</div>{b.agreed_price&&b.qty_kg ? `KSh ${(+b.agreed_price * +b.qty_kg).toLocaleString()}` : '—'}</div>
              </div>

              {b.status !== 'delivered' && b.status !== 'cancelled' && (
                <div className="flex gap-1 mt-2">
                  {b.status === 'booked' && <button className="btn-secondary" style={{fontSize:'0.8rem'}} onClick={() => updateStatus(b.id,'in_transit')}><Truck size={12}/> Mark In Transit</button>}
                  {b.status === 'in_transit' && <button className="btn-primary" style={{fontSize:'0.8rem'}} onClick={() => updateStatus(b.id,'delivered')}><CheckCircle size={12}/> Confirm Delivery & Release M-Pesa</button>}
                  <button className="btn-danger" style={{fontSize:'0.78rem'}} onClick={() => updateStatus(b.id,'cancelled')}>Cancel</button>
                </div>
              )}
              {b.status === 'delivered' && (
                <div style={{ marginTop:'0.75rem', padding:'0.6rem 1rem', background:'rgba(168,214,92,0.08)', borderRadius:8, fontSize:'0.85rem', color:'var(--lime)' }}>
                  ✅ Delivery confirmed — M-Pesa escrow released to farmer
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

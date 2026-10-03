import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, CloudSun, Droplets, ShoppingCart, Truck, Bell, Shield, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.2rem 3rem', borderBottom:'1px solid var(--border-glass)', position:'sticky', top:0, background:'rgba(6,21,15,0.92)', backdropFilter:'blur(20px)', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Leaf size={26} color="#A8D65C" />
          <div>
            <div style={{ fontFamily:'var(--font-serif)', fontSize:'1.1rem', fontWeight:600, color:'var(--text-primary)' }}>ShambaPoint</div>
            <div style={{ fontSize:'0.65rem', color:'var(--lime)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Climate</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'2rem', listStyle:'none' }}>
          {[['#solutions','Solutions'],['#technology','Technology'],['#buyers','Buyers'],['#partners','Partners']].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize:'0.88rem', color:'var(--text-secondary)', textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e=>e.target.style.color='var(--lime)'} onMouseLeave={e=>e.target.style.color='var(--text-secondary)'}>{l}</a>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>🇰🇪</span>
          <Link to="/login" style={{ fontSize:'0.85rem', color:'var(--lime)', textDecoration:'none' }}>Sign in</Link>
          <Link to="/register" className="btn-primary" style={{ padding:'0.5rem 1.1rem', fontSize:'0.85rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section style={{ padding:'6rem 3rem 4rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'4rem', flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(168,214,92,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ flex:'1', minWidth:320, position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(168,214,92,0.08)', border:'1px solid rgba(168,214,92,0.2)', borderRadius:999, padding:'6px 14px', fontSize:'0.78rem', color:'var(--lime)', marginBottom:'1.5rem' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--lime)', animation:'pulse 2s infinite', display:'inline-block' }} />
            AI-Powered · Kenya-Built · Climate-Ready
          </div>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(2.4rem,5vw,4rem)', lineHeight:1.1, color:'var(--text-primary)', marginBottom:'1.5rem' }}>
            Weather will change.<br/>
            <em style={{ fontStyle:'italic', color:'var(--lime)' }}>Your harvest</em><br/>
            doesn't have to.
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'1.05rem', lineHeight:1.7, maxWidth:520, marginBottom:'2rem' }}>
            ShambaPoint Climate gives Kenya's farmers real-time micro-climate intelligence, smart irrigation guidance, and direct connections to verified B2B buyers — paid instantly via M-Pesa.
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding:'0.9rem 2rem', fontSize:'1rem' }}>
              Explore the Platform <ArrowRight size={16}/>
            </Link>
            <a href="#solutions" className="btn-secondary" style={{ padding:'0.9rem 2rem', fontSize:'1rem' }}>
              ▶ Watch the Story
            </a>
          </div>
        </div>

        {/* Live Farm Insights card */}
        <div className="glass-card" style={{ padding:'1.5rem', minWidth:280, maxWidth:320, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.85rem', fontWeight:600, color:'var(--text-primary)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--lime)', animation:'pulse 2s infinite', display:'inline-block' }} />
              Live Farm Insights
            </div>
            <a href="#technology" style={{ fontSize:'0.75rem', color:'var(--lime)' }}>View All →</a>
          </div>
          {[['Soil Moisture','72%','var(--lime)',72],['7-day Rain Chance','38%','var(--blue)',38],['Dry-Spell Risk','Moderate','var(--amber)',54]].map(([label,val,clr,pct]) => (
            <div key={label} style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize:'0.85rem', fontWeight:700, color:clr }}>{val}</span>
              </div>
              <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:3 }}>
                <div style={{ width:`${pct}%`, height:'100%', borderRadius:3, background:clr, transition:'width 1s ease' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop:'1rem', padding:'0.75rem', background:'rgba(232,163,61,0.08)', borderRadius:12, border:'1px solid rgba(232,163,61,0.2)' }}>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4 }}>Risk Score</div>
            <div style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--amber)', fontFamily:'var(--font-serif)' }}>54 <span style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>/ 100</span></div>
            <div style={{ fontSize:'0.78rem', color:'var(--amber)' }}>⚠ Moderate dry-spell risk · Nakuru</div>
          </div>
        </div>
      </section>

      {/* ── Impact Bar ──────────────────────────────────────── */}
      <section style={{ background:'rgba(11,33,24,0.6)', borderTop:'1px solid var(--border-glass)', borderBottom:'1px solid var(--border-glass)', padding:'2.5rem 3rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'2rem', maxWidth:900, margin:'0 auto', textAlign:'center' }}>
          {[
            ['12,400+','Farmers Enrolled','🧑‍🌾'],
            ['340K acres','Monitored Area','🗺️'],
            ['28%','Avg Yield Improvement','📈'],
            ['35%','Water Saved','💧'],
          ].map(([num,label,icon]) => (
            <div key={label}>
              <div style={{ fontSize:'2rem', marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:'var(--font-serif)', fontSize:'2rem', fontWeight:700, color:'var(--lime)' }}>{num}</div>
              <div style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginTop:4 }}>{label}</div>
              <div style={{ color:'var(--text-muted)', fontSize:'0.7rem', marginTop:2, fontStyle:'italic' }}>sample · pilot data</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ────────────────────────────────────── */}
      <section id="solutions" style={{ padding:'5rem 3rem' }}>
        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <div className="section-label" style={{ textAlign:'center' }}>WHAT WE DO</div>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(1.8rem,4vw,3rem)', color:'var(--text-primary)' }}>
            Intelligent Solutions<br/><em>for Every Farm</em>
          </h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.5rem', maxWidth:1100, margin:'0 auto' }}>
          {[
            { icon:<CloudSun size={24} color="var(--lime)"/>, title:'Micro-Climate Forecasts', desc:'Daily dry-spell risk scores and 7-day hyper-local forecasts for individual farms — not just counties.', bg:'rgba(168,214,92,0.08)' },
            { icon:<Droplets size={24} color="var(--blue)"/>, title:'Smart Irrigation', desc:'AI-driven recommendations on when and how much to water, calibrated to soil, crop stage and forecast.', bg:'rgba(96,165,250,0.08)' },
            { icon:<ShoppingCart size={24} color="var(--amber)"/>, title:'Yield Registry & Matching', desc:'Register expected harvests and get automatically matched to verified supermarkets, hotels and exporters.', bg:'rgba(232,163,61,0.08)' },
            { icon:<Truck size={24} color="var(--teal)"/>, title:'Logistics & M-Pesa', desc:'Book trucks and receive M-Pesa payment released automatically on confirmed delivery. Zero cash handling.', bg:'rgba(45,212,191,0.08)' },
          ].map(c => (
            <div key={c.title} className="glass-card" style={{ padding:'2rem' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem' }}>
                {c.icon}
              </div>
              <h3 style={{ fontSize:'1.05rem', color:'var(--text-primary)', marginBottom:'0.75rem' }}>{c.title}</h3>
              <p style={{ fontSize:'0.88rem', lineHeight:1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Strip ─────────────────────────────────────── */}
      <section id="technology" style={{ background:'rgba(11,33,24,0.5)', borderTop:'1px solid var(--border-glass)', borderBottom:'1px solid var(--border-glass)', padding:'3rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'2rem', maxWidth:1000, margin:'0 auto' }}>
          {[
            { icon:<Shield size={22} color="var(--lime)"/>, title:'M-Pesa Escrow', desc:'Payment held securely and released only on confirmed delivery.' },
            { icon:<CheckCircle size={22} color="var(--lime)"/>, title:'Verified Farmers', desc:'Every farmer KYC-verified against national ID and farm location.' },
            { icon:<Shield size={22} color="var(--lime)"/>, title:'Kenya Data Protection Act', desc:'All data protected under the Kenya Data Protection Act 2019.' },
            { icon:<Bell size={22} color="var(--amber)"/>, title:'Forecast Uncertainty', desc:'All predictions show confidence ranges — we never oversell certainty.' },
          ].map(t => (
            <div key={t.title} style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'rgba(168,214,92,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{t.icon}</div>
              <div>
                <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:4, fontSize:'0.9rem' }}>{t.title}</div>
                <p style={{ fontSize:'0.82rem', lineHeight:1.6 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section id="buyers" style={{ padding:'6rem 3rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(168,214,92,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div className="section-label" style={{ textAlign:'center' }}>JOIN THE PILOT</div>
        <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(2rem,4vw,3rem)', color:'var(--text-primary)', marginBottom:'1rem', position:'relative' }}>
          Be among the first to shape<br/><em>Kenya's climate-smart future.</em>
        </h2>
        <p style={{ color:'var(--text-secondary)', maxWidth:520, margin:'0 auto 2rem', lineHeight:1.7 }}>
          Pilot participants get early access, direct support, and input into the product roadmap.
        </p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ padding:'1rem 2.5rem', fontSize:'1rem' }}>
            🌱 Apply as Farmer
          </Link>
          <Link to="/register" className="btn-secondary" style={{ padding:'1rem 2.5rem', fontSize:'1rem' }}>
            🏪 Apply as Buyer
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer id="partners" style={{ background:'rgba(4,11,8,0.95)', borderTop:'1px solid var(--border-glass)', padding:'3rem', fontSize:'0.85rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'2rem', maxWidth:1100, margin:'0 auto 2rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1rem' }}>
              <Leaf size={20} color="#A8D65C"/>
              <span style={{ fontFamily:'var(--font-serif)', fontWeight:600, color:'var(--text-primary)' }}>ShambaPoint Climate</span>
            </div>
            <p style={{ lineHeight:1.7, marginBottom:'1rem' }}>AI-powered climate-resilient agricultural logistics for Kenya's farmers and buyers.</p>
            <div style={{ color:'var(--text-muted)' }}>
              <div>USSD: <code>*483*12#</code> (placeholder)</div>
              <div>WhatsApp: <code>+254 700 000 000</code> (placeholder)</div>
              <div><a href="mailto:support@shambapoint.co.ke" style={{ color:'var(--lime)' }}>support@shambapoint.co.ke</a></div>
            </div>
          </div>
          <div>
            <h4 style={{ color:'var(--text-primary)', marginBottom:'0.75rem', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Platform</h4>
            {[['#solutions','Solutions'],['#technology','Technology'],['/marketplace','Marketplace'],['/register','Join Pilot']].map(([h,l])=>(
              <div key={l} style={{ marginBottom:'0.5rem' }}><a href={h} style={{ color:'var(--text-secondary)' }}>{l}</a></div>
            ))}
          </div>
          <div>
            <h4 style={{ color:'var(--text-primary)', marginBottom:'0.75rem', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Partners (TBC)</h4>
            {['County Government (TBC)','Agri-Finance Partner (TBC)','Development Partner (TBC)','Tech / Telco Partner (TBC)'].map(p=>(
              <div key={p} style={{ color:'var(--text-muted)', marginBottom:'0.4rem', fontSize:'0.8rem' }}>{p}</div>
            ))}
          </div>
          <div>
            <h4 style={{ color:'var(--text-primary)', marginBottom:'0.75rem', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Counties</h4>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
              {['Nairobi','Nakuru','Kericho','Kirinyaga','Meru','Nyeri','Garissa','Kisumu','Uasin Gishu','Machakos','Kitui','Mombasa','Nyandarua','Kajiado'].map(c=>(
                <span key={c} style={{ fontSize:'0.72rem', background:'rgba(168,214,92,0.06)', border:'1px solid var(--border-glass)', borderRadius:999, padding:'2px 8px', color:'var(--text-muted)' }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border-glass)', paddingTop:'1.5rem', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem', alignItems:'center' }}>
          {/* Kenya flag accent */}
          <div style={{ display:'flex', gap:0 }}>
            {['#000','#BE0027','#006600'].map(c=><div key={c} style={{ width:14, height:8, background:c }}/>)}
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>© 2026 ShambaPoint Climate. All metrics are sample/modelled pilot estimates.</p>
          <div style={{ display:'flex', gap:'1.5rem' }}>
            <a href="#" style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>Privacy</a>
            <a href="#" style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>Terms</a>
            <a href="#" style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>Data Protection</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

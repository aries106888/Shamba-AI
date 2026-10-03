import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Leaf, Mic, RotateCcw, Globe } from 'lucide-react';

const API_BASE = '/api';

// ─── Message bubble ──────────────────────────────────────────────
function Bubble({ msg }) {
  const isAI = msg.role === 'model';
  return (
    <div style={{
      display:'flex', justifyContent: isAI ? 'flex-start' : 'flex-end',
      marginBottom:'0.75rem', animation:'fadeInUp 0.3s ease',
    }}>
      {isAI && (
        <div style={{
          width:28, height:28, borderRadius:'50%', background:'rgba(168,214,92,0.15)',
          border:'1px solid rgba(168,214,92,0.3)', display:'flex', alignItems:'center',
          justifyContent:'center', flexShrink:0, marginRight:8, marginTop:2,
        }}>
          <Leaf size={13} color="#A8D65C" />
        </div>
      )}
      <div style={{
        maxWidth:'80%',
        background: isAI
          ? 'rgba(11,33,24,0.9)'
          : 'rgba(168,214,92,0.15)',
        border: `1px solid ${isAI ? 'rgba(168,214,92,0.15)' : 'rgba(168,214,92,0.3)'}`,
        borderRadius: isAI ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        padding:'0.65rem 0.9rem',
        fontSize:'0.85rem',
        lineHeight:1.6,
        color: isAI ? 'var(--text-secondary)' : 'var(--text-primary)',
        whiteSpace:'pre-wrap',
      }}>
        {msg.text}
        <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4, textAlign: isAI ? 'left' : 'right' }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

// ─── Quick suggestion pill ───────────────────────────────────────
function SuggestionPill({ text, onClick }) {
  return (
    <button onClick={() => onClick(text)} style={{
      background:'rgba(168,214,92,0.06)', border:'1px solid rgba(168,214,92,0.2)',
      borderRadius:999, padding:'4px 12px', fontSize:'0.75rem', color:'var(--lime)',
      cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', flexShrink:0,
    }}
    onMouseEnter={e => e.target.style.background='rgba(168,214,92,0.14)'}
    onMouseLeave={e => e.target.style.background='rgba(168,214,92,0.06)'}>
      {text}
    </button>
  );
}

// ─── Main Chat Widget ────────────────────────────────────────────
export default function AIChat({ county, crop }) {
  const [open,        setOpen]        = useState(false);
  const [messages,    setMessages]    = useState([
    {
      role:'model', text:'Habari! Mimi ni Shamba AI. 🌱\n\nI\'m your intelligent farm assistant for ShambaPoint Climate. Ask me anything about weather, irrigation, crop health, yields, or market prices — in Kiswahili or English!\n\nNiambie, nitakusaidiaje leo?',
      time: new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),
    }
  ]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [lang,        setLang]        = useState('en');
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Fetch suggestions on open
  useEffect(() => {
    if (!open) return;
    fetch(`${API_BASE}/ai/suggestions?lang=${lang}${county ? `&county=${county}` : ''}${crop ? `&crop=${crop}` : ''}`)
      .then(r => r.json())
      .then(d => setSuggestions(d.suggestions || []))
      .catch(() => {});
  }, [open, lang, county, crop]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, open]);

  const sendMessage = async (text = input.trim()) => {
    if (!text || loading) return;
    setInput('');

    const userMsg = {
      role:'user', text,
      time: new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message: text, history, county, crop }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role:'model',
        text: data.reply || 'Samahani, jaribu tena. / Sorry, please try again.',
        time: new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role:'model',
        text:'⚠️ Connection error. Make sure the backend is running on port 5000.\n\nJaribu tena baadaye.',
        time: new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([{
    role:'model',
    text:'Chat cleared. Niulize chochote! / Ask me anything! 🌿',
    time: new Date().toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}),
  }]);

  return (
    <>
      {/* ── FAB button ────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position:'fixed', bottom:24, right:24, zIndex:2000,
          width:56, height:56, borderRadius:'50%',
          background: open ? 'var(--bg-mid)' : 'var(--lime)',
          border:`2px solid ${open ? 'var(--border-strong)' : 'transparent'}`,
          color: open ? 'var(--lime)' : '#06150F',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer', boxShadow:'0 4px 20px rgba(168,214,92,0.4)',
          transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
        title="Open Shamba AI"
        aria-label="Open AI farm assistant">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* ── Unread badge ──────────────────────────────────── */}
      {!open && (
        <div style={{
          position:'fixed', bottom:68, right:20, zIndex:2001,
          background:'var(--amber)', borderRadius:999, padding:'3px 8px',
          fontSize:'0.68rem', fontWeight:700, color:'#06150F',
        }}>
          AI
        </div>
      )}

      {/* ── Chat panel ────────────────────────────────────── */}
      {open && (
        <div style={{
          position:'fixed', bottom:88, right:24, zIndex:2000,
          width:360, maxWidth:'calc(100vw - 48px)',
          height:520, maxHeight:'calc(100vh - 120px)',
          background:'rgba(6,21,15,0.97)',
          border:'1px solid var(--border-strong)',
          borderRadius:24,
          boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(168,214,92,0.1)',
          backdropFilter:'blur(24px)',
          display:'flex', flexDirection:'column',
          animation:'slideUp 0.3s cubic-bezier(0.4,0,0.2,1)',
          overflow:'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding:'1rem 1.2rem', borderBottom:'1px solid var(--border-glass)',
            display:'flex', alignItems:'center', gap:10, flexShrink:0,
            background:'rgba(11,33,24,0.8)',
          }}>
            <div style={{
              width:36, height:36, borderRadius:'50%', background:'rgba(168,214,92,0.15)',
              border:'1px solid rgba(168,214,92,0.3)', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Leaf size={16} color="#A8D65C" />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem' }}>Shamba AI</div>
              <div style={{ fontSize:'0.7rem', color:'var(--lime)', display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--lime)', animation:'pulse 2s infinite' }} />
                Powered by Gemini · Farm Expert
              </div>
            </div>
            {/* Lang toggle */}
            <div style={{ display:'flex', gap:3 }}>
              {['en','sw'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  fontSize:'0.68rem', fontWeight:700, padding:'3px 8px', borderRadius:999, border:'none', cursor:'pointer',
                  background: lang===l ? 'var(--lime)' : 'rgba(168,214,92,0.08)',
                  color: lang===l ? '#06150F' : 'var(--lime)',
                  transition:'all 0.2s',
                }}>{l==='sw'?'🇰🇪 SW':'EN'}</button>
              ))}
            </div>
            <button onClick={clearChat} title="Clear chat" style={{
              background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:4,
            }}>
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Context badge */}
          {(county || crop) && (
            <div style={{ padding:'0.4rem 1.2rem', background:'rgba(168,214,92,0.04)', borderBottom:'1px solid var(--border-glass)', fontSize:'0.72rem', color:'var(--text-muted)', display:'flex', gap:8, flexWrap:'wrap' }}>
              <Globe size={11} style={{ marginTop:1 }} />
              {county && <span>📍 {county}</span>}
              {crop   && <span>🌿 {crop}</span>}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.1rem', scrollbarWidth:'thin' }}>
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'0.75rem' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(168,214,92,0.15)', border:'1px solid rgba(168,214,92,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Leaf size={13} color="#A8D65C" />
                </div>
                <div style={{ background:'rgba(11,33,24,0.9)', border:'1px solid rgba(168,214,92,0.15)', borderRadius:'4px 16px 16px 16px', padding:'0.6rem 1rem' }}>
                  <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width:6, height:6, borderRadius:'50%', background:'var(--lime)',
                        animation:`bounce 1s ease infinite ${i*0.15}s`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && (
            <div style={{
              padding:'0.5rem 1rem', borderTop:'1px solid var(--border-glass)',
              display:'flex', gap:'0.4rem', overflowX:'auto', flexShrink:0, scrollbarWidth:'none',
            }}>
              {suggestions.slice(0,4).map((s,i) => (
                <SuggestionPill key={i} text={s} onClick={sendMessage} />
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:'0.75rem 1rem', borderTop:'1px solid var(--border-glass)',
            display:'flex', gap:8, flexShrink:0, background:'rgba(11,33,24,0.6)',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang==='sw' ? 'Andika swali lako hapa…' : 'Ask about your farm…'}
              rows={1}
              disabled={loading}
              style={{
                flex:1, resize:'none', background:'rgba(0,0,0,0.3)',
                border:'1px solid var(--border-glass)', borderRadius:12, padding:'0.6rem 0.85rem',
                color:'var(--text-primary)', fontSize:'0.85rem', fontFamily:'var(--font-sans)',
                lineHeight:1.5, outline:'none', scrollbarWidth:'none',
              }}
              onFocus={e => e.target.style.borderColor='var(--lime)'}
              onBlur={e => e.target.style.borderColor='var(--border-glass)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width:40, height:40, borderRadius:'50%', flexShrink:0,
                background: input.trim() && !loading ? 'var(--lime)' : 'rgba(168,214,92,0.15)',
                border:'none', color: input.trim() && !loading ? '#06150F' : 'var(--text-muted)',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s',
              }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInUp  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes bounce    { 0%,80%,100% { transform:scale(0); } 40% { transform:scale(1); } }
      `}</style>
    </>
  );
}

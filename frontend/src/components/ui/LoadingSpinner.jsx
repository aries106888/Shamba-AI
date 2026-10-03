import React from 'react';

export default function LoadingSpinner({ fullPage, sm }) {
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}/>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading ShambaPoint…</p>
        </div>
      </div>
    );
  }
  return <div className={`spinner${sm ? ' sm' : ''}`} />;
}

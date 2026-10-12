import React from 'react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <header className="no-print" style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('trips')}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div>
            <h1 style={{
              fontSize: '1.25rem',
              margin: 0,
              fontWeight: '800',
              color: '#0f172a',
              letterSpacing: '-0.02em'
            }}>
              Travel Bag Packer
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
              Smart weather. Smart packing.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (No emojis) */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            style={{
              background: activeTab === 'trips' ? '#eff6ff' : 'transparent',
              color: activeTab === 'trips' ? '#2563eb' : '#475569',
              border: `1px solid ${activeTab === 'trips' ? '#bfdbfe' : 'transparent'}`,
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Active Trips
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            style={{
              background: activeTab === 'completed' ? '#ecfdf5' : 'transparent',
              color: activeTab === 'completed' ? '#059669' : '#475569',
              border: `1px solid ${activeTab === 'completed' ? '#a7f3d0' : 'transparent'}`,
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Completed Trips
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            style={{
              background: activeTab === 'guide' ? '#eff6ff' : 'transparent',
              color: activeTab === 'guide' ? '#2563eb' : '#475569',
              border: `1px solid ${activeTab === 'guide' ? '#bfdbfe' : 'transparent'}`,
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            City Survival Guide
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            style={{
              background: activeTab === 'ai' ? '#eff6ff' : 'transparent',
              color: activeTab === 'ai' ? '#2563eb' : '#475569',
              border: `1px solid ${activeTab === 'ai' ? '#bfdbfe' : 'transparent'}`,
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Gemini AI Advisor
          </button>
        </div>

        {/* User Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={user.name}
                style={{ width: '34px', height: '34px', borderRadius: '50%', border: '2px solid #2563eb', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {user.isGoogle ? 'Google Account' : 'Traveler'}
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

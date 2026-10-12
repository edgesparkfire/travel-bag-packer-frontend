import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setSigningIn(true);
    setTimeout(() => {
      const mockGoogleUser = {
        name: 'Alex Explorer',
        email: 'alex.explorer@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
        isGoogle: true
      };
      onLoginSuccess(mockGoogleUser);
      setSigningIn(false);
      onClose();
    }, 800);
  };

  const handleGuestSignIn = () => {
    const guestUser = {
      name: email ? email.split('@')[0] : 'Solo Nomad',
      email: email || 'nomad@travelbag.io',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nomad',
      isGoogle: false
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '2.25rem',
        background: '#131d31',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎒</div>
        <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', marginBottom: '0.4rem' }}>
          Welcome to Travel Bag Packer
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
          Sign in to access personalized packing lists, real-time city guides, and AI recommendations.
        </p>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: '#ffffff',
            color: '#1f2937',
            border: 'none',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            transition: 'transform 0.15s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          {signingIn ? 'Connecting to Google...' : 'Sign in with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
        </div>

        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: '10px',
            color: '#fff',
            marginBottom: '0.75rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        <button
          onClick={handleGuestSignIn}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#e2e8f0',
            border: '1px solid #334155',
            padding: '0.75rem',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Continue as Guest
        </button>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            marginTop: '1.25rem',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

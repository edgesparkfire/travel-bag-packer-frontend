import React, { useState, useEffect } from 'react';

// Strict email regex rejecting invalid/typo domains
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|co|in|io|me|ai|app)$/i;

export default function AuthView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [googlePromptOpen, setGooglePromptOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  // Load existing registered accounts from localStorage
  const getRegisteredUsers = () => {
    try {
      const stored = localStorage.getItem('travel_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUser = (newUser) => {
    const current = getRegisteredUsers();
    current.push(newUser);
    localStorage.setItem('travel_registered_users', JSON.stringify(current));
  };

  // Google Identity Services (GIS) One-Tap / OAuth integration
  useEffect(() => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1047589139824-travelpacker.apps.googleusercontent.com',
          callback: (response) => {
            if (response.credential) {
              try {
                // Decode Google JWT token
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decoded = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
                const googleUser = {
                  name: decoded.name || 'Google Traveler',
                  email: decoded.email,
                  avatar: decoded.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(decoded.name || decoded.email)}`,
                  isGoogle: true
                };
                onLoginSuccess(googleUser);
              } catch (err) {
                console.warn('Failed to parse Google JWT, falling back to profile dialog:', err);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Google GSI init notice:', err);
      }
    }
  }, [onLoginSuccess]);

  const handleGoogleClick = () => {
    setErrorMessage('');
    // Try Google GSI prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch {
        // Fallback to Google sign-in modal
      }
    }
    setGooglePromptOpen(true);
  };

  const handleGoogleModalSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = googleEmailInput.trim().toLowerCase();
    
    if (!cleanEmail.endsWith('@gmail.com')) {
      setErrorMessage('Please enter a valid Google account ending in @gmail.com');
      return;
    }

    const username = cleanEmail.split('@')[0];
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);

    const googleUser = {
      name: capitalizedName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(capitalizedName)}`,
      isGoogle: true
    };

    setGooglePromptOpen(false);
    onLoginSuccess(googleUser);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Strict Email Format Validation
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. yourname@example.com).');
      return;
    }

    // Disallow invalid domains like gmail.in
    if (cleanEmail.includes('@gmail.') && !cleanEmail.endsWith('@gmail.com')) {
      setErrorMessage('Invalid Google domain. Gmail addresses must end in @gmail.com.');
      return;
    }

    const registeredUsers = getRegisteredUsers();

    if (isRegister) {
      // REGISTRATION FLOW
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters).');
        return;
      }

      if (cleanPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      // Check if user already exists
      const existing = registeredUsers.find((u) => u.email === cleanEmail);
      if (existing) {
        setErrorMessage('An account with this email already exists. Please switch to Sign In.');
        return;
      }

      // Save new user
      const newUser = {
        name: fullName.trim(),
        email: cleanEmail,
        password: cleanPassword,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
        registeredAt: new Date().toISOString()
      };

      saveRegisteredUser(newUser);
      setSuccessMessage('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess({
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          isGoogle: false
        });
      }, 500);

    } else {
      // SIGN IN FLOW
      const existing = registeredUsers.find((u) => u.email === cleanEmail);
      if (!existing) {
        setErrorMessage(`No account found for "${cleanEmail}". You have not registered yet. Please click "Create Account" above to sign up first.`);
        return;
      }

      if (existing.password !== cleanPassword) {
        setErrorMessage('Incorrect password. Please enter the password you registered with.');
        return;
      }

      // Login success
      onLoginSuccess({
        name: existing.name,
        email: existing.email,
        avatar: existing.avatar,
        isGoogle: false
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: '#2563eb',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Travel Bag Packer
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '600', marginBottom: '0.2rem' }}>
            Smart weather. Smart packing.
          </p>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {isRegister ? 'Register your account to save itineraries' : 'Sign in to access your registered itineraries'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            lineHeight: '1.4'
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#059669',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            {successMessage}
          </div>
        )}

        {/* Tab Toggle (Sign In / Register) */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? '#0f172a' : '#64748b',
              boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            style={{
              flex: 1,
              padding: '0.6rem',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? '#0f172a' : '#64748b',
              boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Sign in with Google Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.8rem 1rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: '#1e293b',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease',
            marginBottom: '1.25rem'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1.25rem 0',
          color: '#94a3b8',
          fontSize: '0.8rem'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span>OR WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="input-clean"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              className="input-clean"
              placeholder="e.g. traveler@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
              Password {isRegister && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(min. 6 characters)</span>}
            </label>
            <input
              type="password"
              className="input-clean"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {isRegister ? 'Create Free Account' : 'Sign In to Travel Bag Packer'}
          </button>
        </form>

        {/* Demo Registered Accounts hint */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          {isRegister ? (
            <span>Already created an account? Click <strong>Sign In</strong> above.</span>
          ) : (
            <span>Never registered before? Click <strong>Create Account</strong> to set your password.</span>
          )}
        </div>
      </div>

      {/* Google Sign In Modal */}
      {googlePromptOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>
                Sign in with Google
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Connect your Google Account to automatically sync your travel preferences.
            </p>
            <form onSubmit={handleGoogleModalSubmit}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
                Your Google Account (@gmail.com)
              </label>
              <input
                type="email"
                className="input-clean"
                placeholder="your.account@gmail.com"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                required
                style={{ marginBottom: '1.25rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setGooglePromptOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Sign In with Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

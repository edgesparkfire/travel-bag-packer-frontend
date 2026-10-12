import React, { useState, useEffect } from 'react';
import { cityGuideService } from '../services/api';

const popularCities = ['Hyderabad', 'Mumbai', 'Delhi', 'Tokyo', 'London', 'Paris', 'New York'];

export default function CityGuideView({ defaultCity = 'Hyderabad' }) {
  const [city, setCity] = useState(defaultCity);
  const [searchQuery, setSearchQuery] = useState(defaultCity);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuide(defaultCity);
  }, [defaultCity]);

  const loadGuide = (cityName) => {
    setLoading(true);
    cityGuideService.getGuide(cityName)
      .then((data) => {
        setGuide(data);
        setCity(cityName);
      })
      .catch((err) => console.error('Failed to load city guide:', err))
      .finally(() => setLoading(false));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadGuide(searchQuery.trim());
    }
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      {/* Header and City Selector (No Heading Emojis) */}
      <div className="card-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              First-Time Visitor City Survival Guide
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
              Verified official tourism sources, local transit rules, emergency helplines & cultural customs.
            </p>
          </div>

          {/* Quick city selection pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {popularCities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setSearchQuery(c);
                  loadGuide(c);
                }}
                style={{
                  background: city.toLowerCase() === c.toLowerCase() ? '#2563eb' : '#f8fafc',
                  color: city.toLowerCase() === c.toLowerCase() ? '#ffffff' : '#334155',
                  border: `1px solid ${city.toLowerCase() === c.toLowerCase() ? '#2563eb' : '#e2e8f0'}`,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            className="input-clean"
            placeholder="Search any destination city (e.g. Hyderabad, Tokyo, Paris)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}>
            Explore Guide
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading verified survival intelligence...
        </div>
      ) : guide ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Destination Hero Banner */}
          <div className="card-panel" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderLeft: '4px solid #2563eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge-pill badge-blue" style={{ marginBottom: '0.5rem' }}>
                  {guide.city}, {guide.country}
                </span>
                <h3 style={{ fontSize: '1.55rem', fontWeight: '800', color: '#0f172a', margin: '0.3rem 0', letterSpacing: '-0.02em' }}>
                  {guide.city} Visitor Survival Briefing
                </h3>
              </div>
              
              {/* Best Time & Voltage Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {guide.bestTimeToVisit && (
                  <div className="badge-pill badge-green">
                    Best Season: {guide.bestTimeToVisit}
                  </div>
                )}
                {guide.voltageAndSocket && (
                  <div className="badge-pill badge-amber">
                    Voltage: {guide.voltageAndSocket}
                  </div>
                )}
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', marginBottom: '1rem' }}>
              {guide.generalSummary}
            </p>

            {/* Knowledge Source Verification Badge */}
            {guide.knowledgeSource && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem',
                color: '#1d4ed8',
                fontWeight: '600'
              }}>
                <span>Verified Source:</span>
                <span>{guide.knowledgeSource}</span>
              </div>
            )}
          </div>

          {/* Core Survival Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* 1. Emergency Helplines (No heading emoji) */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Emergency Contacts & Helplines
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {guide.emergencyContacts && Object.entries(guide.emergencyContacts).map(([name, phone]) => (
                  <div key={name} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#334155' }}>{name}</span>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      color: '#dc2626',
                      background: '#fee2e2',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}>
                      {phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Public Transit & Train Rules */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Public Transit & Train Guidelines
                </h4>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {guide.transportAdvice?.map((tip, idx) => (
                  <li key={idx} style={{
                    fontSize: '0.88rem',
                    color: '#334155',
                    lineHeight: '1.45',
                    background: '#f8fafc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Ride-Hailing Apps */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Recommended Ride Apps & Cabs
                </h4>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {guide.rideApps?.map((app, idx) => (
                  <span key={idx} style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    {app}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0 }}>
                Always book via verified apps to ensure upfront GPS pricing and avoid street haggling.
              </p>
            </div>

            {/* 4. Drinking Water */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Drinking Water Safety
                </h4>
              </div>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                color: '#1e40af',
                lineHeight: '1.5'
              }}>
                {guide.tapWaterStatus}
              </div>
            </div>

            {/* 5. Cultural Customs & Dress Norms */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Cultural Etiquette & Dress Norms
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
                {guide.culturalEtiquette?.map((norm, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.88rem',
                    color: '#334155',
                    lineHeight: '1.45',
                    background: '#f8fafc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {norm}
                  </div>
                ))}
              </div>
              {guide.tippingCulture && (
                <div style={{ fontSize: '0.83rem', color: '#475569', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.65rem', borderRadius: '8px' }}>
                  <strong>Tipping Custom:</strong> {guide.tippingCulture}
                </div>
              )}
            </div>

            {/* 6. Local Survival Phrases */}
            <div className="card-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                  Local Survival Phrases
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {guide.commonPhrases && Object.entries(guide.commonPhrases).map(([eng, loc]) => (
                  <div key={eng} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{eng}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Must Try Iconic Regional Dishes */}
          <div className="card-panel" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Must-Try Iconic Dishes in {guide.city}
              </h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {guide.mustTryDishes?.map((dish, idx) => (
                <div key={idx} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  color: '#1e293b'
                }}>
                  {dish}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          No city guide information available for this destination.
        </div>
      )}
    </div>
  );
}

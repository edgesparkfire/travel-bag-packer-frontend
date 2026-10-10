import { useState, useEffect } from 'react';
import { tripService } from './services/api';

const containerStyle = {
  padding: '2.5rem 1.5rem',
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  maxWidth: '780px',
  margin: '0 auto',
  color: '#e2e8f0',
  background: '#0f172a',
  minHeight: '100vh',
  lineHeight: 1.6
};

const formStyle = {
  background: '#1e293b',
  padding: '1.75rem',
  borderRadius: '12px',
  marginBottom: '2.5rem',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
  border: '1px solid #334155'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem'
};

const inputGroupStyle = { marginBottom: '1.25rem' };
const labelStyle = { display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.9rem', color: '#94a3b8' };
const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #475569',
  background: '#0f172a',
  color: '#f8fafc',
  boxSizing: 'border-box',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const buttonStyle = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  padding: '0.85rem 1.5rem',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '1rem',
  width: '100%',
  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  transition: 'all 0.2s ease'
};

const cardStyle = {
  background: '#1e293b',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  borderRadius: '12px',
  borderLeft: '5px solid #10b981',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
  border: '1px solid #334155'
};

const categoryBadge = (category) => {
  const colors = {
    'Clothing': { bg: '#1e3a8a', text: '#93c5fd' },
    'Essentials': { bg: '#701a75', text: '#f5d0fe' },
    'Weather Gear': { bg: '#854d0e', text: '#fde047' }
  };
  const color = colors[category] || { bg: '#334155', text: '#cbd5e1' };
  return {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    background: color.bg,
    color: color.text,
    marginLeft: '0.5rem'
  };
};

function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxWeight, setMaxWeight] = useState(23.0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = () => {
    tripService.getAllTrips()
      .then(data => {
        setTrips(Array.isArray(data) ? data : []);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load trips:", err);
        setError("Could not connect to Spring Boot server. Please ensure backend is running.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      alert("Please fill in destination and travel dates!");
      return;
    }

    setSubmitting(true);
    const newTrip = {
      destination,
      startDate,
      endDate,
      maxWeightLimit: parseFloat(maxWeight) || 0
    };

    try {
      const savedTrip = await tripService.createTrip(newTrip);
      setTrips(prev => [savedTrip, ...prev]);
      setDestination('');
      setStartDate('');
      setEndDate('');
      setMaxWeight(23.0);
      setError(null);
    } catch (err) {
      console.error("Error saving trip:", err);
      alert("Failed to submit trip to Spring Boot server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePacked = async (tripId, itemId) => {
    try {
      const updatedTrip = await tripService.toggleItemPacked(tripId, itemId);
      setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    } catch (err) {
      console.error("Error toggling packed status:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Connecting to Spring Boot Backend...</h2>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0', background: 'linear-gradient(to right, #34d399, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🎒 Travel Backpack Planner
        </h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          Spring Boot + MongoDB Flexible Packing Rules Engine
        </p>
      </header>

      {error && (
        <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#fecaca' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Trip Creation Form */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginTop: 0, color: '#34d399', fontSize: '1.25rem', marginBottom: '1.25rem' }}>
          ✨ Plan a New Journey
        </h3>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Destination</label>
          <input
            type="text"
            placeholder="e.g. Paris, Tokyo, London, Zurich"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={gridStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Max Luggage Weight Limit (kg)</label>
          <input
            type="number"
            step="0.1"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button type="submit" disabled={submitting} style={buttonStyle}>
          {submitting ? 'Generating Itinerary...' : '🚀 Generate Trip & Packing List'}
        </button>
      </form>

      {/* Render Active Itineraries */}
      <section>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          🗺️ Active Itineraries ({trips.length})
        </h2>

        {trips.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            No trips planned yet! Fill out the form above to add one.
          </p>
        ) : (
          trips.map((trip) => {
            const packingList = trip.packingList || [];
            const packedCount = packingList.filter(i => i.isPacked).length;
            const progress = packingList.length > 0 ? Math.round((packedCount / packingList.length) * 100) : 0;

            return (
              <div key={trip.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.4rem', color: '#f8fafc' }}>
                      📍 {trip.destination}
                    </h3>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      🗓️ {trip.startDate} to {trip.endDate} ({trip.durationDays || '1'} days)
                    </p>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      ⚖️ Max Allowance: {trip.maxWeightLimit} kg
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '130px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 'bold' }}>
                      {packedCount}/{packingList.length} Packed ({progress}%)
                    </span>
                    <div style={{ width: '130px', height: '6px', background: '#334155', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Packing List Checklist */}
                {packingList.length > 0 && (
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #334155' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '1rem' }}>
                      📋 Automated Packing Checklist
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
                      {packingList.map((item) => (
                        <label
                          key={item.itemId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: item.isPacked ? '#064e3b' : '#0f172a',
                            border: `1px solid ${item.isPacked ? '#059669' : '#334155'}`,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={Boolean(item.isPacked)}
                            onChange={() => handleTogglePacked(trip.id, item.itemId)}
                            style={{ marginRight: '0.6rem', accentColor: '#10b981', cursor: 'pointer' }}
                          />
                          <span style={{ flex: 1, textDecoration: item.isPacked ? 'line-through' : 'none', color: item.isPacked ? '#a7f3d0' : '#f1f5f9', fontSize: '0.85rem' }}>
                            {item.itemName} <strong style={{ color: '#38bdf8' }}>×{item.quantity}</strong>
                          </span>
                          <span style={categoryBadge(item.category)}>
                            {item.category}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default App;

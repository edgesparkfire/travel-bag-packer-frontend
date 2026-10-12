import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import TripForm from './components/TripForm';
import PackingChecklist from './components/PackingChecklist';
import CityGuideView from './components/CityGuideView';
import GeminiAdvisorView from './components/GeminiAdvisorView';
import { tripService } from './services/api';

export default function App() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('trips'); // 'trips', 'completed', 'guide', 'ai'
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('travel_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [error, setError] = useState(null);

  const fetchTrips = () => {
    tripService.getAllTrips()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setTrips(list);
        if (list.length > 0 && !selectedTripId) {
          setSelectedTripId(list[0].id);
        }
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load trips from backend:', err);
        setError('Could not connect to Spring Boot backend. Please verify server is running on port 8080.');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('travel_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('travel_user');
  };

  const handleCreateTrip = async (tripData) => {
    setFormLoading(true);
    try {
      const createdTrip = await tripService.createTrip(tripData);
      setTrips((prev) => [createdTrip, ...prev]);
      setSelectedTripId(createdTrip.id);
      setError(null);
    } catch (err) {
      console.error('Error creating trip:', err);
      alert('Failed to submit trip to Spring Boot server.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleItem = (tripId, itemId, isPacked) => {
    // 1. Instant optimistic local UI update (0ms latency)
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          packingList: (t.packingList || []).map((item) =>
            item.itemId === itemId ? { ...item, isPacked } : item
          )
        };
      })
    );

    // 2. Background sync with backend
    tripService.toggleItemPacked(tripId, itemId, isPacked)
      .then((updatedTrip) => {
        // Sync with verified backend state
        setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
      })
      .catch((err) => {
        console.error('Error syncing packed item toggle:', err);
      });
  };

  const handleToggleComplete = async (tripId, isCompleted) => {
    try {
      const updatedTrip = await tripService.toggleTripCompleted(tripId, isCompleted);
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    } catch (err) {
      console.error('Error toggling trip complete:', err);
    }
  };

  const handleBudgetTierChange = async (tripId, budgetTier) => {
    try {
      const updatedTrip = await tripService.changeBudgetTier(tripId, budgetTier);
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updatedTrip : t)));
    } catch (err) {
      console.error('Error updating budget tier:', err);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await tripService.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (selectedTripId === tripId) {
        setSelectedTripId(null);
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
    }
  };

  const handleTripUpdated = (updatedTrip) => {
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const activeTrips = trips.filter((t) => !t.isCompleted);
  const completedTrips = trips.filter((t) => t.isCompleted);
  const currentSelectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0] || null;

  const totalItems = trips.reduce((acc, t) => acc + (t.packingList?.length || 0), 0);
  const totalPacked = trips.reduce((acc, t) => acc + (t.packingList?.filter(i => i.isPacked).length || 0), 0);
  const overallProgress = totalItems > 0 ? Math.round((totalPacked / totalItems) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', width: '92%', margin: '1.5rem auto', flex: 1 }}>
        {/* Error Banner if Backend is down */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>{error}</div>
            <button
              onClick={fetchTrips}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Metric Overview Cards (No heading emojis) */}
        <div className="no-print" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Active Itineraries
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>
              {activeTrips.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>
              {completedTrips.length} completed trips saved
            </div>
          </div>

          <div className="card-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Overall Packing Status
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2563eb', margin: '0.2rem 0' }}>
              {overallProgress}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {totalPacked} of {totalItems} items packed
            </div>
          </div>

          <div className="card-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Current Destination
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: '0.2rem 0' }}>
              {currentSelectedTrip ? (currentSelectedTrip.destinationCity || currentSelectedTrip.destination) : 'Hyderabad'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {currentSelectedTrip?.weatherSummary || 'Clear • 24°C'}
            </div>
          </div>

          <div className="card-panel" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              AI Travel Assistant
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', margin: '0.2rem 0' }}>
              {currentSelectedTrip?.aiChatHistory?.length || 1} Messages
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600' }}>
              Saved inside trip
            </div>
          </div>
        </div>

        {/* TAB 1: ACTIVE TRIPS */}
        {activeTab === 'trips' && (
          <div>
            <TripForm onSubmit={handleCreateTrip} loading={formLoading} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Active Packing Checklists ({activeTrips.length})
              </h3>
              {completedTrips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('completed')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  View {completedTrips.length} Completed Trips ➔
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                Loading your itineraries...
              </div>
            ) : activeTrips.length === 0 ? (
              <div className="card-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>No Active Trips Planned Yet</h4>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  Use the route form above to plan your journey and generate your customized packing kit.
                </p>
              </div>
            ) : (
              activeTrips.map((trip) => (
                <PackingChecklist
                  key={trip.id}
                  trip={trip}
                  onToggleItem={handleToggleItem}
                  onToggleComplete={handleToggleComplete}
                  onBudgetTierChange={handleBudgetTierChange}
                  onDeleteTrip={handleDeleteTrip}
                  onOpenChat={(t) => {
                    setSelectedTripId(t.id);
                    setActiveTab('ai');
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* TAB 2: COMPLETED TRIPS WITH SAVED CHAT HISTORY */}
        {activeTab === 'completed' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Completed Trip History & Saved AI Conversations
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Review your finished trips, packed items, and previous Gemini AI discussions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('trips')}
                className="btn-secondary"
              >
                ← Back to Active Trips
              </button>
            </div>

            {completedTrips.length === 0 ? (
              <div className="card-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
                <h4 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>No Completed Trips Yet</h4>
                <p style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  When you finish packing an active trip, click "Mark Completed" to archive it here with its full Gemini AI chat history.
                </p>
              </div>
            ) : (
              completedTrips.map((trip) => (
                <div key={trip.id} style={{ marginBottom: '2.5rem' }}>
                  <PackingChecklist
                    trip={trip}
                    onToggleItem={handleToggleItem}
                    onToggleComplete={handleToggleComplete}
                    onBudgetTierChange={handleBudgetTierChange}
                    onDeleteTrip={handleDeleteTrip}
                    onOpenChat={(t) => {
                      setSelectedTripId(t.id);
                      setActiveTab('ai');
                    }}
                  />

                  {/* Saved AI Chat History for this completed trip */}
                  {trip.aiChatHistory && trip.aiChatHistory.length > 0 && (
                    <div className="card-panel" style={{ padding: '1.5rem', marginTop: '-1rem', borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0, background: '#f8fafc' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                          Saved Gemini AI Conversation from this Trip ({trip.aiChatHistory.length} messages)
                        </h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                        {trip.aiChatHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: '12px',
                              background: msg.sender === 'user' ? '#eff6ff' : '#ffffff',
                              border: `1px solid ${msg.sender === 'user' ? '#bfdbfe' : '#e2e8f0'}`,
                              fontSize: '0.88rem',
                              color: '#1e293b',
                              lineHeight: '1.45',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: msg.sender === 'user' ? '#2563eb' : '#7c3aed', marginBottom: '0.2rem' }}>
                              {msg.sender === 'user' ? 'Traveler Question' : 'Gemini AI Response'} • {msg.timestamp || ''}
                            </div>
                            {msg.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CITY SURVIVAL GUIDE */}
        {activeTab === 'guide' && (
          <CityGuideView
            defaultCity={currentSelectedTrip ? (currentSelectedTrip.destinationCity || currentSelectedTrip.destination) : 'Hyderabad'}
          />
        )}

        {/* TAB 4: GEMINI AI ADVISOR WITH IN-TRIP CHAT PERSISTENCE */}
        {activeTab === 'ai' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Gemini Travel Assistant & Cultural Guide
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Chat in real-time about clothing, electronics, Indian train standards (RAC/WL/Tatkal), and etiquette.
                </p>
              </div>

              {trips.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>Active Itinerary:</span>
                  <select
                    className="input-clean"
                    value={selectedTripId || ''}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    style={{ padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.85rem' }}
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.destinationCity || t.destination} ({t.startDate}) {t.isCompleted ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <GeminiAdvisorView
              activeTrip={currentSelectedTrip}
              onTripUpdated={handleTripUpdated}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print" style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <div style={{ fontWeight: '700', color: '#0f172a' }}>
          Travel Bag Packer
        </div>
        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
          Smart weather. Smart packing.
        </div>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';

const countryCityData = {
  'India': ['Hyderabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Jaipur', 'Goa', 'Chennai', 'Kolkata', 'Agra', 'Varanasi', 'Kochi', 'Pune', 'Ahmedabad'],
  'Pakistan': ['Hyderabad', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot'],
  'United States': ['New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Miami', 'Las Vegas', 'Seattle', 'Washington D.C.', 'Boston', 'Austin'],
  'United Kingdom': ['London', 'Edinburgh', 'Manchester', 'Bath', 'Oxford', 'Cambridge', 'Birmingham', 'Liverpool'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Al Khobar'],
  'France': ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Strasbourg'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Sapporo', 'Fukuoka', 'Nara'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'],
  'Singapore': ['Singapore'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Gold Coast'],
  'Italy': ['Rome', 'Milan', 'Florence', 'Venice', 'Naples'],
  'Thailand': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
  'Turkey': ['Istanbul', 'Antalya', 'Cappadocia', 'Ankara', 'Izmir']
};

const transportOptions = [
  { id: 'TRAIN', label: 'Train', desc: 'Coach bedding, seat kits & berth locks' },
  { id: 'FLIGHT', label: 'Flight', desc: 'TSA 100ml liquid limits & baggage weight' },
  { id: 'CAR', label: 'Car / Road', desc: 'Navigation mounts & emergency kits' },
  { id: 'BUS', label: 'Bus / Coach', desc: 'Sleeper comfort & compact essentials' }
];

const budgetTiers = [
  {
    id: 'BUDGET',
    label: 'Economic / Backpacker',
    desc: 'Minimalist pack: quick-dry clothing, multi-use washables, locker padlock, compact micro-towel. Zero excess luggage.'
  },
  {
    id: 'BALANCED',
    label: 'Balanced Standard',
    desc: 'Smart traveler: versatile capsule wardrobe, day-to-evening outfits, transit comfort essentials, travel umbrella.'
  },
  {
    id: 'LUXURY',
    label: 'Luxury / Executive',
    desc: 'Premium comfort: crisp breathable linen, formal evening attire, noise-cancelling headphones, garment steamer, skincare kit.'
  }
];

export default function TripForm({ onSubmit, loading }) {
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getFutureDate = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  // Departure (From) State
  const [fromCountry, setFromCountry] = useState('United States');
  const [fromCity, setFromCity] = useState('New York');
  const [isFromCustom, setIsFromCustom] = useState(false);
  const [fromCustomCity, setFromCustomCity] = useState('');
  const [fromCustomCountry, setFromCustomCountry] = useState('');

  // Destination (To) State
  const [destCountry, setDestCountry] = useState('India');
  const [destCity, setDestCity] = useState('Hyderabad');
  const [isDestCustom, setIsDestCustom] = useState(false);
  const [destCustomCity, setDestCustomCity] = useState('');
  const [destCustomCountry, setDestCustomCountry] = useState('');

  // Geolocation state
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Trip Dates and Details
  const [startDate, setStartDate] = useState(getTomorrow());
  const [endDate, setEndDate] = useState(getFutureDate(5));
  const [transportMode, setTransportMode] = useState('TRAIN');
  const [travelStyle, setTravelStyle] = useState('Sightseeing');
  const [maxWeight, setMaxWeight] = useState(20.0);
  
  // Budget tier state
  const [budgetTier, setBudgetTier] = useState('BALANCED');
  const [showTierSelector, setShowTierSelector] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  // Auto-detect browser geolocation for Departure
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setLocationStatus('Requesting GPS location access...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationStatus('Resolving your city and country...');
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const detectedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || 'Hyderabad';
          const detectedCountry = data.address?.country || 'India';

          // Match in existing list or set custom
          const matchedCountry = Object.keys(countryCityData).find(
            (c) => c.toLowerCase() === detectedCountry.toLowerCase()
          );

          if (matchedCountry) {
            setFromCountry(matchedCountry);
            setIsFromCustom(false);
            const citiesInCountry = countryCityData[matchedCountry];
            const matchedCity = citiesInCountry.find((c) => c.toLowerCase() === detectedCity.toLowerCase());
            if (matchedCity) {
              setFromCity(matchedCity);
            } else {
              setFromCity(citiesInCountry[0] || detectedCity);
            }
          } else {
            setIsFromCustom(true);
            setFromCountry('Custom');
            setFromCustomCity(detectedCity);
            setFromCustomCountry(detectedCountry);
          }

          setLocationStatus(`Departure set to: ${detectedCity}, ${detectedCountry}`);
        } catch (err) {
          setFromCountry('India');
          setFromCity('Hyderabad');
          setIsFromCustom(false);
          setLocationStatus('Departure set to: Hyderabad, India');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLocationStatus('Location access skipped. Please choose from dropdowns.');
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFromCountryChange = (country) => {
    setFromCountry(country);
    if (country === 'Custom') {
      setIsFromCustom(true);
      setFromCity('');
    } else {
      setIsFromCustom(false);
      const cities = countryCityData[country] || [];
      setFromCity(cities[0] || country);
    }
  };

  const handleDestCountryChange = (country) => {
    setDestCountry(country);
    if (country === 'Custom') {
      setIsDestCustom(true);
      setDestCity('');
    } else {
      setIsDestCustom(false);
      const cities = countryCityData[country] || [];
      setDestCity(cities[0] || country);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const days = calculateDays();

  const handleSubmit = (e) => {
    e.preventDefault();

    const resolvedFromCity = isFromCustom ? fromCustomCity.trim() : fromCity.trim();
    const resolvedFromCountry = isFromCustom ? fromCustomCountry.trim() : fromCountry.trim();

    const resolvedDestCity = isDestCustom ? destCustomCity.trim() : destCity.trim();
    const resolvedDestCountry = isDestCustom ? destCustomCountry.trim() : destCountry.trim();

    if (!resolvedFromCity) {
      alert('Please specify your departure origin city.');
      return;
    }

    if (!resolvedDestCity) {
      alert('Please specify your travel destination city.');
      return;
    }

    // Validate that Origin and Destination are not the exact same city in the same country
    if (
      resolvedFromCity.toLowerCase() === resolvedDestCity.toLowerCase() &&
      resolvedFromCountry.toLowerCase() === resolvedDestCountry.toLowerCase()
    ) {
      alert(
        `Departure origin and travel destination cannot be the exact same place (${resolvedFromCity}, ${resolvedFromCountry}). Please select a distinct destination.`
      );
      return;
    }

    if (days !== null && days <= 0) {
      alert('End date must be on or after start date.');
      return;
    }

    const nextCount = generationCount + 1;
    setGenerationCount(nextCount);

    // If triggered multiple times or user desired alternate tiers, reveal tier choices
    if (nextCount > 1) {
      setShowTierSelector(true);
    }

    const finalOrigin = `${resolvedFromCity}, ${resolvedFromCountry !== 'Custom' ? resolvedFromCountry : ''}`.replace(/,\s*$/, '');
    const finalDest = `${resolvedDestCity}, ${resolvedDestCountry !== 'Custom' ? resolvedDestCountry : ''}`.replace(/,\s*$/, '');

    onSubmit({
      originCountry: resolvedFromCountry,
      originCity: finalOrigin,
      destinationCountry: resolvedDestCountry,
      destinationCity: resolvedDestCity,
      destination: finalDest,
      startDate,
      endDate,
      durationDays: days,
      transportMode,
      travelStyle,
      budgetTier,
      maxWeightLimit: parseFloat(maxWeight) || 20.0
    });
  };

  const currentFromCityList = countryCityData[fromCountry] || [];
  const currentDestCityList = countryCityData[destCountry] || [];

  return (
    <form onSubmit={handleSubmit} className="card-panel no-print" style={{
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      {/* Header (Strictly Zero Emojis) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Plan Your Travel Route & Packing List
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.2rem' }}>
            Smart weather forecast, cultural standards, transit kit, and clothing calculations.
          </p>
        </div>
        {days !== null && days > 0 && (
          <div className="badge-pill badge-green" style={{ fontSize: '0.88rem', padding: '0.4rem 0.9rem' }}>
            Tour Duration: {days} {days === 1 ? 'Day' : 'Days'}
          </div>
        )}
      </div>

      {/* 1. DEPARTURE (FROM) SECTION */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' }}>
            Departure Location (From)
          </label>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#2563eb',
              cursor: 'pointer'
            }}
          >
            {detectingLocation ? 'Detecting Location...' : 'Use My Current Location'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
          {/* Departure Country */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
              Departure Country
            </label>
            <select
              className="input-clean"
              value={fromCountry}
              onChange={(e) => handleFromCountryChange(e.target.value)}
            >
              {Object.keys(countryCityData).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="Custom">Other Country / Region</option>
            </select>
          </div>

          {/* Departure City */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
              Departure City
            </label>
            {!isFromCustom ? (
              <select
                className="input-clean"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
              >
                {currentFromCityList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-clean"
                  placeholder="Enter departure city..."
                  value={fromCustomCity}
                  onChange={(e) => setFromCustomCity(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input-clean"
                  placeholder="Country name..."
                  value={fromCustomCountry}
                  onChange={(e) => setFromCustomCountry(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Departure Quick City Chips */}
        {!isFromCustom && currentFromCityList.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Popular in {fromCountry}:</span>
            {currentFromCityList.slice(0, 6).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setFromCity(city)}
                style={{
                  background: fromCity.toLowerCase() === city.toLowerCase() ? '#2563eb' : '#ffffff',
                  color: fromCity.toLowerCase() === city.toLowerCase() ? '#ffffff' : '#334155',
                  border: `1px solid ${fromCity.toLowerCase() === city.toLowerCase() ? '#2563eb' : '#cbd5e1'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {locationStatus && (
          <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.5rem', fontWeight: '500' }}>
            {locationStatus}
          </div>
        )}
      </div>

      {/* 2. DESTINATION (TO) SECTION */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' }}>
          Travel Destination (To)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
          {/* Destination Country */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
              Destination Country
            </label>
            <select
              className="input-clean"
              value={destCountry}
              onChange={(e) => handleDestCountryChange(e.target.value)}
            >
              {Object.keys(countryCityData).map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
              <option value="Custom">Other Country / Region</option>
            </select>
          </div>

          {/* Destination City */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
              Destination City
            </label>
            {!isDestCustom ? (
              <select
                className="input-clean"
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
              >
                {currentDestCityList.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="input-clean"
                  placeholder="Enter destination city..."
                  value={destCustomCity}
                  onChange={(e) => setDestCustomCity(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input-clean"
                  placeholder="Country name..."
                  value={destCustomCountry}
                  onChange={(e) => setDestCustomCountry(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick City Chips for Destination */}
        {!isDestCustom && currentDestCityList.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Popular in {destCountry}:</span>
            {currentDestCityList.slice(0, 6).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setDestCity(city)}
                style={{
                  background: destCity.toLowerCase() === city.toLowerCase() ? '#2563eb' : '#ffffff',
                  color: destCity.toLowerCase() === city.toLowerCase() ? '#ffffff' : '#334155',
                  border: `1px solid ${destCity.toLowerCase() === city.toLowerCase() ? '#2563eb' : '#cbd5e1'}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {city}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. DATES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
            Start Date
          </label>
          <input
            type="date"
            className="input-clean"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
            End Date
          </label>
          <input
            type="date"
            className="input-clean"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 4. MODE OF TRANSPORTATION */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.6rem' }}>
          Mode of Transportation
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {transportOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setTransportMode(opt.id)}
              style={{
                background: transportMode === opt.id ? '#eff6ff' : '#ffffff',
                border: `2px solid ${transportMode === opt.id ? '#2563eb' : '#e2e8f0'}`,
                padding: '0.85rem',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: transportMode === opt.id ? '#1d4ed8' : '#0f172a' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
                {opt.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TRAVEL STYLE AND MAX WEIGHT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
            Travel Style
          </label>
          <select
            className="input-clean"
            value={travelStyle}
            onChange={(e) => setTravelStyle(e.target.value)}
          >
            <option value="Sightseeing">Sightseeing / Tourism</option>
            <option value="Casual">Casual Vacation</option>
            <option value="Adventure">Adventure / Trekking</option>
            <option value="Business">Business / Work Trip</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>
            Max Luggage Weight (kg)
          </label>
          <input
            type="number"
            step="0.5"
            className="input-clean"
            value={maxWeight}
            onChange={(e) => setMaxWeight(e.target.value)}
          />
        </div>
      </div>

      {/* 6. DISCRETE PACKING METHOD (BUDGET TO LUXURY) */}
      {showTierSelector && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '14px',
          padding: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
              Select Packing Method (Budget Tier)
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Tailored from economic backpacker to executive luxury
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {budgetTiers.map((tier) => (
              <div
                key={tier.id}
                onClick={() => setBudgetTier(tier.id)}
                style={{
                  background: budgetTier === tier.id ? '#ffffff' : '#f1f5f9',
                  border: `2px solid ${budgetTier === tier.id ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: budgetTier === tier.id ? '#1d4ed8' : '#1e293b' }}>
                  {tier.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', lineHeight: '1.4' }}>
                  {tier.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Tier link if not already displayed */}
      {!showTierSelector && (
        <div style={{ textAlign: 'right', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setShowTierSelector(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Customize Packing Method (Backpacker vs Standard vs Luxury)
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
      >
        {loading ? 'Fetching Weather & Calculating Packing List...' : 'Generate Automated Packing List'}
      </button>
    </form>
  );
}

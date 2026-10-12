import React, { useState } from 'react';

const categoryStyles = {
  'Clothing': { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  'Essentials': { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  'Electronics': { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  'Weather Gear': { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
  'Transport Gear': { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' }
};

const budgetTierLabels = {
  'BUDGET': 'Economic Backpacker',
  'BALANCED': 'Balanced Standard',
  'LUXURY': 'Luxury Executive'
};

export default function PackingChecklist({ trip, onToggleItem, onToggleComplete, onBudgetTierChange, onDeleteTrip, onOpenChat }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (!trip) return null;

  const packingList = trip.packingList || [];
  const packedCount = packingList.filter(item => item.isPacked).length;
  const progress = packingList.length > 0 ? Math.round((packedCount / packingList.length) * 100) : 0;
  const isCompleted = Boolean(trip.isCompleted);
  const currentTier = trip.budgetTier || 'BALANCED';

  // Filter items
  const filteredItems = packingList.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.reason && item.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Clothing', 'Essentials', 'Electronics', 'Transport Gear', 'Weather Gear'];

  return (
    <div className="card-panel" style={{
      padding: '2rem',
      marginBottom: '2rem',
      borderLeft: `5px solid ${isCompleted ? '#059669' : '#2563eb'}`
    }}>
      {/* Trip Header Banner (No heading emojis) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>
              {trip.destinationCity || trip.destination}
            </h3>
            {trip.destinationCountry && (
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                ({trip.destinationCountry})
              </span>
            )}
            <span className="badge-pill badge-blue">
              {trip.transportMode || 'Train'}
            </span>
            <span className="badge-pill badge-amber">
              {budgetTierLabels[currentTier] || 'Balanced Standard'}
            </span>
            {isCompleted && (
              <span className="badge-pill badge-green">
                Completed
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#475569' }}>
            {trip.originCity && (
              <span>Origin: <strong>{trip.originCity}</strong></span>
            )}
            <span>Dates: <strong>{trip.startDate}</strong> to <strong>{trip.endDate}</strong> ({trip.durationDays || 1} Days)</span>
            <span>Max Weight: <strong>{trip.maxWeightLimit || 20} kg</strong></span>
            {trip.weatherSummary && (
              <span style={{ color: '#0284c7' }}>Weather: <strong>{trip.weatherSummary}</strong></span>
            )}
          </div>
        </div>

        {/* Progress & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: progress === 100 ? '#059669' : '#2563eb' }}>
              {progress}% Packed
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {packedCount} of {packingList.length} items
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Toggle Completion */}
            {onToggleComplete && (
              <button
                type="button"
                onClick={() => onToggleComplete(trip.id, !isCompleted)}
                style={{
                  background: isCompleted ? '#eff6ff' : '#ecfdf5',
                  color: isCompleted ? '#2563eb' : '#059669',
                  border: `1px solid ${isCompleted ? '#bfdbfe' : '#a7f3d0'}`,
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isCompleted ? 'Mark Active' : 'Mark Completed'}
              </button>
            )}

            {/* View / Open Chat */}
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(trip)}
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Trip AI Chat ({trip.aiChatHistory?.length || 0})
              </button>
            )}

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              title="Print or Save as PDF"
              style={{
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Print / PDF
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDeleteTrip(trip.id)}
              title="Delete Trip"
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Discrete Packing Method Switcher (Budget to Luxury) */}
      <div className="no-print" style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '0.65rem 1rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
          Packing Method (Budget Tier):
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'BUDGET', label: 'Economic Backpacker' },
            { id: 'BALANCED', label: 'Balanced Standard' },
            { id: 'LUXURY', label: 'Luxury Executive' }
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => onBudgetTierChange && onBudgetTierChange(trip.id, tier.id)}
              style={{
                background: currentTier === tier.id ? '#2563eb' : '#ffffff',
                color: currentTier === tier.id ? '#ffffff' : '#334155',
                border: `1px solid ${currentTier === tier.id ? '#2563eb' : '#cbd5e1'}`,
                padding: '0.3rem 0.7rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: '#e2e8f0',
        borderRadius: '999px',
        height: '10px',
        overflow: 'hidden',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          background: progress === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #2563eb, #3b82f6)',
          width: `${progress}%`,
          height: '100%',
          borderRadius: '999px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Filter and Search Bar */}
      <div className="no-print" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const count = cat === 'All' ? packingList.length : packingList.filter(i => i.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  background: isSelected ? '#2563eb' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                  padding: '0.4rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{cat}</span>
                <span style={{
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isSelected ? '#fff' : '#64748b',
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter packed items..."
          className="input-clean"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '220px', padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
        />
      </div>

      {/* Packing Items List with Native Checkbox & Instant Click Response */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
            No items found matching the selected filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const catStyle = categoryStyles[item.category] || { bg: '#f1f5f9', border: '#cbd5e1', text: '#334155' };
            const isItemPacked = Boolean(item.isPacked);

            return (
              <label
                key={item.itemId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  background: isItemPacked ? '#f8fafc' : '#ffffff',
                  border: `1px solid ${isItemPacked ? '#e2e8f0' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1 }}>
                  {/* Real Accessible Native Checkbox */}
                  <input
                    type="checkbox"
                    checked={isItemPacked}
                    onChange={(e) => {
                      onToggleItem(trip.id, item.itemId, e.target.checked);
                    }}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#059669',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />

                  {/* Name and Reason */}
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      color: isItemPacked ? '#64748b' : '#0f172a',
                      textDecoration: isItemPacked ? 'line-through' : 'none'
                    }}>
                      {item.itemName}
                    </div>
                    {item.reason && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                        {item.reason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Quantity Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    background: catStyle.bg,
                    border: `1px solid ${catStyle.border}`,
                    color: catStyle.text,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '8px'
                  }}>
                    {item.category}
                  </span>

                  <span style={{
                    background: '#f1f5f9',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '8px',
                    minWidth: '2.5rem',
                    textAlign: 'center'
                  }}>
                    ×{item.quantity}
                  </span>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

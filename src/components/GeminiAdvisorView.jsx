import React, { useState, useEffect, useRef } from 'react';
import { tripService, aiAdvisorService } from '../services/api';

export default function GeminiAdvisorView({ activeTrip, onTripUpdated }) {
  const [tipsData, setTipsData] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const destination = activeTrip?.destinationCity || activeTrip?.destination || 'Hyderabad';
  const origin = activeTrip?.originCity || 'New York, USA';
  const duration = activeTrip?.durationDays || 4;
  const transport = activeTrip?.transportMode || 'TRAIN';

  // Load tips and synchronize chat history with trip
  useEffect(() => {
    if (activeTrip?.aiChatHistory && activeTrip.aiChatHistory.length > 0) {
      setChatMessages(activeTrip.aiChatHistory);
    } else {
      setChatMessages([
        {
          sender: 'gemini',
          text: `Hello! I am your Google Gemini AI Travel Advisor.\n\nI am analyzing your route from ${origin} to ${destination} (${duration} Days by ${transport}).\n\nAsk me anything about clothes to pack, electronics & power sockets, Indian Railways standards (RAC/WL/Tatkal), temple dress norms, or drinking water safety!`,
          timestamp: 'Just now'
        }
      ]);
    }

    setLoadingTips(true);
    aiAdvisorService.getAiTips(origin, destination, duration, transport)
      .then((data) => setTipsData(data))
      .catch((err) => console.error('Failed to load AI tips:', err))
      .finally(() => setLoadingTips(false));
  }, [activeTrip?.id, destination, origin]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSendMessage = async (customText) => {
    const messageToSend = (customText || userInput).trim();
    if (!messageToSend || chatLoading) return;

    setUserInput('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newChat = [...chatMessages, { sender: 'user', text: messageToSend, timestamp: timeNow }];
    setChatMessages(newChat);
    setChatLoading(true);

    try {
      if (activeTrip?.id) {
        const response = await tripService.chatWithGemini(activeTrip.id, messageToSend);
        if (response.chatHistory) {
          setChatMessages(response.chatHistory);
          if (onTripUpdated) {
            onTripUpdated({ ...activeTrip, aiChatHistory: response.chatHistory });
          }
        }
      } else {
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              sender: 'gemini',
              text: `Here is detailed advice for your journey to ${destination} regarding "${messageToSend}": Please ensure your electrical chargers support 100-240V and pack breathable cotton clothing with modest coverage for historic places.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 600);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'gemini',
          text: 'Could not reach server. Please check your connection or backend service status.',
          timestamp: timeNow
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const sampleQuestions = [
    'How do Indian train tickets and RAC / WL status work?',
    'What voltage & power adapter do I need from USA to Hyderabad?',
    'What clothes should I pack for local modesty & temples?',
    'Is tap water safe and what are drinking water rules?',
    'Where is the best authentic Hyderabadi Dum Biryani & Irani Chai?'
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
      {/* LEFT COLUMN: Interactive Gemini AI Chat Panel */}
      <div className="card-panel" style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '750px',
        backgroundColor: '#ffffff'
      }}>
        {/* Chat Header (No heading emojis) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Gemini AI Travel Advisor
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Trip Chat Saved • {origin} ➔ {destination}
            </p>
          </div>
          <span className="badge-pill badge-blue">
            Active & Saved to Trip
          </span>
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ask Gemini Instant Doubts:
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          {chatMessages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <div style={{
                  maxWidth: '82%',
                  background: isUser ? '#2563eb' : '#ffffff',
                  color: isUser ? '#ffffff' : '#1e293b',
                  padding: '0.85rem 1.1rem',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                  <div style={{
                    fontSize: '0.68rem',
                    color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                    marginTop: '0.4rem',
                    textAlign: isUser ? 'right' : 'left'
                  }}>
                    {msg.timestamp || ''}
                  </div>
                </div>
              </div>
            );
          })}
          {chatLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
              <span>Gemini is generating response...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.6rem' }}
        >
          <input
            type="text"
            className="input-clean"
            placeholder="Ask Gemini about clothes, adapters, train RAC/WL, or food..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={chatLoading || !userInput.trim()}
            className="btn-primary"
            style={{ padding: '0 1.25rem' }}
          >
            Send
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Destination-Specific Detailed Guidance Cards (No Heading Emojis) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '750px', overflowY: 'auto' }}>
        {/* 1. Clothing Advice */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              Detailed Clothing & Fabric Advice
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tipsData?.clothingAdvice ? (
              tipsData.clothingAdvice.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.45', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {item}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Analyzing wardrobe requirements...</div>
            )}
          </div>
        </div>

        {/* 2. Electronics & Voltage */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              Electronics, Voltage & Power Sockets
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tipsData?.electronicsAdvice ? (
              tipsData.electronicsAdvice.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.45', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {item}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Checking electrical standards...</div>
            )}
          </div>
        </div>

        {/* 3. Transit Hacks */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              Transit & Luggage Packing Hacks
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tipsData?.transitHacks ? (
              tipsData.transitHacks.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.45', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {item}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Formulating transit recommendations...</div>
            )}
          </div>
        </div>

        {/* 4. Local Survival Gems */}
        <div className="card-panel" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>
              Local Survival Rules & Etiquette
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {tipsData?.localGems ? (
              tipsData.localGems.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.86rem', color: '#334155', lineHeight: '1.45', background: '#f8fafc', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {item}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading survival rules...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

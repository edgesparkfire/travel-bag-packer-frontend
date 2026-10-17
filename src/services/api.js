import axios from 'axios';

// Dynamically points to Vercel/Render env var in production or localhost:8080 in dev
const defaultBaseUrl = import.meta.env.PROD
  ? 'https://travel-bag-packer.onrender.com'
  : 'http://localhost:8080';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || defaultBaseUrl;
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const tripService = {
  // Fetch all trips
  getAllTrips: async () => {
    try {
      const response = await api.get('/api/trips');
      return response.data;
    } catch (error) {
      console.error("Error fetching trips from backend:", error);
      throw error;
    }
  },

  // Fetch single trip details
  getTripById: async (id) => {
    try {
      const response = await api.get(`/api/trips/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching trip details:", error);
      throw error;
    }
  },

  // Save new trip (triggers packing rules, weather & transport adaptors)
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/api/trips', tripData);
      return response.data;
    } catch (error) {
      console.error("Error creating a new trip:", error);
      throw error;
    }
  },

  // Change packing budget tier (BUDGET, BALANCED, LUXURY)
  changeBudgetTier: async (tripId, budgetTier) => {
    try {
      const response = await api.patch(`/api/trips/${tripId}/tier`, { budgetTier });
      return response.data;
    } catch (error) {
      console.error("Error changing budget tier:", error);
      throw error;
    }
  },

  // Toggle item packed status
  toggleItemPacked: async (tripId, itemId, isPacked) => {
    try {
      const payload = isPacked !== undefined ? { isPacked } : null;
      const response = await api.patch(`/api/trips/${tripId}/items/${itemId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error toggling packed status:", error);
      throw error;
    }
  },

  // Toggle trip completion
  toggleTripCompleted: async (tripId, isCompleted) => {
    try {
      const payload = isCompleted !== undefined ? { isCompleted } : null;
      const response = await api.patch(`/api/trips/${tripId}/complete`, payload);
      return response.data;
    } catch (error) {
      console.error("Error toggling trip completion:", error);
      throw error;
    }
  },

  // Interactive chat with Gemini AI saved within the trip
  chatWithGemini: async (tripId, message) => {
    try {
      const response = await api.post(`/api/trips/${tripId}/chat`, { message });
      return response.data;
    } catch (error) {
      console.error("Error chatting with Gemini AI:", error);
      throw error;
    }
  },

  // Delete trip
  deleteTrip: async (id) => {
    try {
      await api.delete(`/api/trips/${id}`);
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }
};

export const cityGuideService = {
  // Fetch verified first-time visitor city guide
  getGuide: async (city) => {
    try {
      const response = await api.get('/api/city-guide', {
        params: { city }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching city guide:", error);
      throw error;
    }
  }
};

export const aiAdvisorService = {
  // Fetch Gemini AI packing hacks & local advice with origin & destination
  getAiTips: async (origin, destination, durationDays, transportMode) => {
    try {
      const response = await api.post('/api/ai/tips', {
        origin,
        destination,
        durationDays,
        transportMode
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching AI tips:", error);
      throw error;
    }
  }
};

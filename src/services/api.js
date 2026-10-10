import axios from 'axios';

// Connects directly to running Spring Boot backend port
const API_URL = 'http://localhost:8080/api/trips';

export const tripService = {
  // Fetch all trips
  getAllTrips: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching trips from backend:", error);
      throw error;
    }
  },

  // Fetch single trip details
  getTripById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching trip details:", error);
      throw error;
    }
  },

  // Save a brand new trip (triggers rules engine & weather service)
  createTrip: async (tripData) => {
    try {
      const response = await axios.post(API_URL, tripData);
      return response.data;
    } catch (error) {
      console.error("Error creating a new trip:", error);
      throw error;
    }
  },

  // Toggle item packed status
  toggleItemPacked: async (tripId, itemId) => {
    try {
      const response = await axios.patch(`${API_URL}/${tripId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error("Error toggling packed status:", error);
      throw error;
    }
  }
};

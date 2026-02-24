// eventService.js - API client for event-related functionality
import { API_CONFIG } from '../config';

// Base URL for all API requests
const BASE_URL = API_CONFIG.BASE_URL || 'http://localhost:8081/api';

const handleResponse = async (response) => {
  // First check for HTTP errors
  if (!response.ok) {
    // Try to extract the error message from the response body
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`;
    } catch (e) {
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
      // Special case for 404s that might indicate a missing microservice routing
      if (response.status === 404) {
        errorMessage = 'Service endpoint not found. Please verify backend services are running.';
      }
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) {
    return {};
  }

  // Parse JSON responses
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    return { text };
  }
};


export const getEvents = async () => {
  try {
    const response = await fetch(`${BASE_URL}/events`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};


export const getEventDetails = async (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/events/details?id=${eventId}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};


export const searchEvents = async (criteria = {}) => {
  try {
    // Build query string from criteria
    const params = new URLSearchParams();

    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = `${BASE_URL}/events/search${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching events:', error);
    // Differentiate between network failures (like Connection Refused) and API errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Connection refused. Is the EventApp microservice running?');
    }
    throw error;
  }
};


export const bookEvent = async (eventId, numTickets) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  if (!numTickets || numTickets <= 0) {
    throw new Error('Valid number of tickets is required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events/${eventId}/book?tickets=${numTickets}`, {
      method: 'POST',
      headers: headers
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error booking event:', error);
    throw error;
  }
};

export const cancelBooking = async (eventId, numTickets) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  if (!numTickets || numTickets <= 0) {
    throw new Error('Valid number of tickets is required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events/${eventId}/cancel?tickets=${numTickets}`, {
      method: 'POST',
      headers: headers
    });

    const result = await handleResponse(response);

    // To ensure proper data structure for client-side updates
    if (result.success) {
      if (!result.remainingTickets && result.remainingTickets !== 0) {
        console.warn('API did not return remainingTickets value');
        // Add a default value if the API doesn't return it
        result.remainingTickets = "Updated";
      }
    }

    return result;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};


export const processRefund = async (eventId, numTickets, bookingReference) => {
  if (!eventId || !bookingReference) {
    throw new Error('Event ID and booking reference are required');
  }

  if (!numTickets || numTickets <= 0) {
    throw new Error('Valid number of tickets is required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events/${eventId}/refund`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        tickets: numTickets,
        bookingReference: bookingReference
      })
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};


export const convertEventPrice = async (eventId, toCurrency) => {
  if (!eventId || !toCurrency) {
    throw new Error('Event ID and target currency are required');
  }

  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}/convertPrice?toCurrency=${toCurrency}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error converting price:', error);
    throw error;
  }
};


export const getDirectionsToEvent = async (eventId, fromAddress, mode = 'driving') => {
  if (!eventId || !fromAddress) {
    throw new Error('Event ID and starting address are required');
  }

  try {
    // Encode parameters for URL
    const encodedAddress = encodeURIComponent(fromAddress);
    const encodedMode = encodeURIComponent(mode);

    const url = `${BASE_URL}/events/${eventId}/directions?fromAddress=${encodedAddress}&mode=${encodedMode}`;
    const response = await fetch(url);

    return await handleResponse(response);
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
};

export const getCityInfo = async (city) => {
  if (!city) {
    throw new Error('City name is required');
  }

  try {
    const response = await fetch(`${BASE_URL}/events/city-info?city=${encodeURIComponent(city)}`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching city info:', error);
    throw error;
  }
};

export const getEventStatistics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/events/statistics`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  if (!eventData) {
    throw new Error('Event data is required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(eventData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  if (!eventId || !eventData) {
    throw new Error('Event ID and updated data are required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events/update/${eventId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(eventData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/events/${eventId}/cancelEvent`, {
      method: 'POST',
      headers: headers
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString; // Return original if invalid date
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default {
  getEvents,
  getEventDetails,
  searchEvents,
  bookEvent,
  cancelBooking,
  processRefund,
  convertEventPrice,
  getDirectionsToEvent,
  getCityInfo,
  getEventStatistics,
  createEvent,
  updateEvent,
  deleteEvent,
  formatDate
};
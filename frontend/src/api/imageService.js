// API service for event images
import { API_CONFIG } from '../config';
const IMAGE_API_BASE_URL = API_CONFIG.IMAGE_SERVICE_URL;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // If the server response wasn't ok, try to get error message
    const errorData = await response.text();
    let errorMessage = 'An error occurred';

    try {
      // Try to parse as JSON
      const json = JSON.parse(errorData);
      errorMessage = json.error || errorMessage;
    } catch (e) {
      // If parsing fails, use the raw error text
      errorMessage = errorData || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const text = await response.text();

  // If the response is empty, return an empty object
  if (!text) return {};

  // Otherwise parse and return the JSON
  return JSON.parse(text);
};

// Cache for promises to prevent duplicate simultaneous network requests
const requestCache = new Map();

// Get an image URL for a specific event type
export const getEventImage = async (eventType) => {
  try {
    if (!eventType) {
      return { success: false, error: 'Event type is required' };
    }

    const url = `${IMAGE_API_BASE_URL}/images/event?type=${encodeURIComponent(eventType)}`;

    // Check if we are already fetching this term
    if (requestCache.has(url)) {
      return await requestCache.get(url);
    }

    // Create a new promise and cache it immediately
    const fetchPromise = fetch(url)
      .then(handleResponse)
      .catch(err => {
        // Remove from cache on failure so it can be retried later
        requestCache.delete(url);
        throw err;
      });

    requestCache.set(url, fetchPromise);
    return await fetchPromise;
  } catch (error) {
    console.error('Error fetching event image:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch image'
    };
  }
};

export default {
  getEventImage
};
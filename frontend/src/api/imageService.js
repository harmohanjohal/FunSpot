// API service for event images
const IMAGE_API_BASE_URL = 'http://localhost:8081/api/events';

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

// Get an image URL for a specific event type
export const getEventImage = async (eventType) => {
  try {
    if (!eventType) {
      return { success: false, error: 'Event type is required' };
    }
    
    const url = `${IMAGE_API_BASE_URL}/images/event?type=${encodeURIComponent(eventType)}`;
    const response = await fetch(url);
    return await handleResponse(response);
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
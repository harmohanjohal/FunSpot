// Admin API service for event management
const API_BASE_URL = 'http://localhost:8081/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    let errorMessage = 'An error occurred';

    try {
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

// Create a new event (admin only)
export const createEvent = async (eventData) => {
  try {
    console.log('Creating event with data:', eventData);

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event (admin only)
export const updateEvent = async (eventId, eventData) => {
  try {
    console.log('Updating event with data:', eventData);

    const response = await fetch(`${API_BASE_URL}/events/update/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event (admin only)
export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/cancelEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get event statistics (admin only)
export const getEventStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/statistics`);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    throw error;
  }
};
// eventService.js - API client for event-related functionality
import { API_CONFIG } from '../config';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, orderBy, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';

// Base URL for all remaining Java microservices (e.g. Directions, Currency)
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
    const eventsCol = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    return eventSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching events from Firebase:', error);
    throw new Error('Failed to load events from database.');
  }
};


export const getEventDetails = async (eventId) => {
  if (!eventId) {
    throw new Error('Event ID is required');
  }

  try {
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Event not found.');
    }
  } catch (error) {
    console.error('Error fetching event details from Firebase:', error);
    throw new Error('Failed to load event details.');
  }
};


export const searchEvents = async (criteria = {}) => {
  try {
    // For simple querying without complex indexes in Firebase,
    // we fetch all and filter in memory since dataset is currently small.
    // If dataset grows, we should implement proper Firestore compound queries.
    const events = await getEvents();

    return events.filter(event => {
      let matches = true;
      if (criteria.title) {
        matches = matches && event.title.toLowerCase().includes(criteria.title.toLowerCase());
      }
      if (criteria.type) {
        matches = matches && event.type === criteria.type;
      }
      if (criteria.city) {
        matches = matches && event.city.toLowerCase() === criteria.city.toLowerCase();
      }
      return matches;
    });
  } catch (error) {
    console.error('Error searching events in Firebase:', error);
    throw new Error('Failed to search events.');
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
    const eventRef = doc(db, 'events', eventId);
    // Note: To be fully transactional, we should use runTransaction here.
    // For now, we update the tickets natively via increment.

    // First, verify there are enough tickets
    const docSnap = await getDoc(eventRef);
    if (!docSnap.exists()) throw new Error("Event does not exist.");

    const data = docSnap.data();
    const available = (data.totalTickets || data.total_tickets) - (data.bookedTickets || data.booked_tickets || 0);

    if (available < numTickets) {
      throw new Error(`Not enough tickets available. Only ${available} left.`);
    }

    await updateDoc(eventRef, {
      bookedTickets: increment(numTickets),
      booked_tickets: increment(numTickets) // Support legacy field name if exists
    });

    return { success: true, message: "Successfully booked tickets." };
  } catch (error) {
    console.error('Error booking event in Firebase:', error);
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
    const eventRef = doc(db, 'events', eventId);

    // Decrease the bookedTickets count
    await updateDoc(eventRef, {
      bookedTickets: increment(-Math.abs(numTickets)),
      booked_tickets: increment(-Math.abs(numTickets))
    });

    return {
      success: true,
      remainingTickets: "Updated"
    };
  } catch (error) {
    console.error('Error cancelling booking in Firebase:', error);
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
    const eventRef = doc(db, 'events', eventId);

    // Decrease the bookedTickets count for refund
    await updateDoc(eventRef, {
      bookedTickets: increment(-Math.abs(numTickets)),
      booked_tickets: increment(-Math.abs(numTickets))
    });

    return {
      success: true,
      message: "Refund processed successfully"
    };
  } catch (error) {
    console.error('Error processing refund in Firebase:', error);
    throw error;
  }
};


export const convertEventPrice = async (amount, fromCurrency, toCurrency) => {
  if (amount === undefined || !fromCurrency || !toCurrency) {
    throw new Error('Amount, source, and target currency are required');
  }

  try {
    const url = `${BASE_URL}/events/convertPrice?amount=${amount}&fromCurrency=${encodeURIComponent(fromCurrency)}&toCurrency=${encodeURIComponent(toCurrency)}`;
    const response = await fetch(url);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error converting price:', error);
    throw error;
  }
};


export const getDirectionsToEvent = async (event, fromAddress, mode = 'driving') => {
  if (!event || !fromAddress) {
    throw new Error('Event object and starting address are required');
  }

  try {
    // Encode parameters for URL
    let url = `${BASE_URL}/events/directions?fromAddress=${encodeURIComponent(fromAddress)}&mode=${encodeURIComponent(mode)}`;
    if (event.location) url += `&venueName=${encodeURIComponent(event.location)}`;
    if (event.venueAddress) url += `&venueAddress=${encodeURIComponent(event.venueAddress)}`;
    if (event.city) url += `&city=${encodeURIComponent(event.city)}`;
    if (event.postcode) url += `&postcode=${encodeURIComponent(event.postcode)}`;

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
  formatDate
};
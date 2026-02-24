import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { API_CONFIG } from '../../config';

// Constants for the application
const API_BASE_URL = API_CONFIG.BASE_URL;

function EventSearch() {
  // State for search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    title: '',
    eventType: '', // Changed from 'type' to 'eventType'
    location: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: '',
    minAgeRating: '',
    maxAgeRating: '',
    hasFreeTickets: false,
    sortBy: 'date',
    sortOrder: 'asc'
  });

  // State for events and UI
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Event type options that match your Java model
  const eventTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'theater', label: 'Theater' },
    { value: 'concert', label: 'Concert' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'conference', label: 'Conference' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'sports', label: 'Sports' },
    { value: 'convention', label: 'Convention' }
  ];

  // Load events on initial render
  useEffect(() => {
    searchEvents();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Search for events using API
  const searchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = {};

      // Add non-empty parameters to the query
      if (searchCriteria.title) params.title = searchCriteria.title;

      // Using the correct parameter name for backend compatibility
      if (searchCriteria.eventType) {
        // This is the key fix - using 'eventType' as the parameter name
        params.eventType = searchCriteria.eventType;
      }

      if (searchCriteria.location) params.location = searchCriteria.location;
      if (searchCriteria.startDate) params.startDate = searchCriteria.startDate + 'T00:00:00';
      if (searchCriteria.endDate) params.endDate = searchCriteria.endDate + 'T23:59:59';
      if (searchCriteria.minPrice) params.minPrice = searchCriteria.minPrice;
      if (searchCriteria.maxPrice) params.maxPrice = searchCriteria.maxPrice;
      if (searchCriteria.minAgeRating) params.minAgeRating = searchCriteria.minAgeRating;
      if (searchCriteria.maxAgeRating) params.maxAgeRating = searchCriteria.maxAgeRating;
      if (searchCriteria.hasFreeTickets) params.hasFreeTickets = searchCriteria.hasFreeTickets;
      if (searchCriteria.sortBy) params.sortBy = searchCriteria.sortBy;
      if (searchCriteria.sortOrder) params.sortOrder = searchCriteria.sortOrder;

      // Make the API call
      const response = await axios.get(`${API_BASE_URL}/events/search`, { params });

      // Check response structure and extract events
      if (response.data && response.data.success) {
        setEvents(response.data.events || []);
      } else if (Array.isArray(response.data)) {
        setEvents(response.data);
      } else {
        setEvents([]);
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setError('Failed to search events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset search criteria
  const handleReset = () => {
    setSearchCriteria({
      title: '',
      eventType: '', // Changed from 'type' to 'eventType'
      location: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: '',
      minAgeRating: '',
      maxAgeRating: '',
      hasFreeTickets: false,
      sortBy: 'date',
      sortOrder: 'asc'
    });

    // Reload all events
    searchEvents();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchEvents();
  };

  return (
    <div className="event-search-container">
      <h2 className="search-title">Find Events</h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-basic">
          {/* Search input */}
          <input
            type="text"
            placeholder="Search by event name..."
            value={searchCriteria.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="search-input"
          />

          {/* Event type dropdown */}
          <select
            value={searchCriteria.eventType} // Changed from 'type' to 'eventType'
            onChange={(e) => handleInputChange('eventType', e.target.value)} // Changed from 'type' to 'eventType'
            className="search-select"
          >
            {eventTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Search buttons */}
          <button type="submit" className="search-button">Search</button>
          <button type="button" onClick={handleReset} className="reset-button">Reset</button>
        </div>

        {/* Advanced search toggle */}
        <div className="advanced-toggle">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="toggle-button"
          >
            {showAdvanced ? '- Hide Advanced Search' : '+ Advanced Search'}
          </button>
        </div>

        {/* Advanced search fields */}
        {showAdvanced && (
          <div className="advanced-search">
            <div className="search-row">
              <div className="search-field">
                <label>Start Date</label>
                <input
                  type="date"
                  value={searchCriteria.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>End Date</label>
                <input
                  type="date"
                  value={searchCriteria.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Search in venue/city"
                  value={searchCriteria.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>Free Tickets Only</label>
                <input
                  type="checkbox"
                  checked={searchCriteria.hasFreeTickets}
                  onChange={(e) => handleInputChange('hasFreeTickets', e.target.checked)}
                />
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={searchCriteria.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                />
              </div>

              <div className="search-field">
                <label>Max Price</label>
                <input
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={searchCriteria.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            <div className="search-row">
              <div className="search-field">
                <label>Sort By</label>
                <select
                  value={searchCriteria.sortBy}
                  onChange={(e) => handleInputChange('sortBy', e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="price">Price</option>
                  <option value="title">Title</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div className="search-field">
                <label>Sort Order</label>
                <select
                  value={searchCriteria.sortOrder}
                  onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Loading and error states */}
      {loading && <div className="loading">Loading events...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Results count */}
      {!loading && !error && (
        <div className="results-count">
          Found {events.length} events
        </div>
      )}

      {/* Events grid */}
      <div className="events-grid">
        {events.map(event => (
          <div key={event.eventId} className="event-card">
            <h3 className="event-title">{event.title}</h3>

            <div className="event-details">
              <p><strong>Date:</strong> {formatDate(event.date)}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Type:</strong> {event.eventType}</p>
              <p><strong>Price:</strong> {event.ticketPrice} {event.currency}</p>
              <p><strong>Available Tickets:</strong> {event.totalTickets - event.bookedTickets}</p>
            </div>

            <div className="event-actions">
              <button className="directions-button">Get Directions</button>
              <button className="book-button">Login to Book</button>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {!loading && !error && events.length === 0 && (
        <div className="no-results">
          No events found matching your search criteria.
        </div>
      )}
    </div>
  );
}

export default EventSearch;
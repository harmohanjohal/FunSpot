import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, searchEvents, formatDate } from '../../api/eventService';
import { useAuth } from '../../context/AuthContext';
import { SkeletonGrid } from '../common/SkeletonLoader';
import SearchForm from './SearchForm';
import GetDirectionsModal from './GetDirectionsModal';
import EventImage from './EventImage';
import AboutCityButton from './AboutCityButton';

function ViewEvents() {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Search state
  const [searchParams, setSearchParams] = useState({});

  // Directions modal state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);

  // Function to perform search using the API
  const performSearch = async (criteria, pageDirection = null) => {
    try {
      setLoading(true);
      setError(null);

      // Calculate the new page based on direction
      let newPage = page;
      if (pageDirection === 'next') {
        newPage = page + 1;
      } else if (pageDirection === 'prev') {
        newPage = Math.max(1, page - 1);
      } else {
        // Reset to page 1 for new searches
        newPage = 1;
      }

      // Format dates if they exist
      const formattedCriteria = { ...criteria };

      if (formattedCriteria.startDate) {
        formattedCriteria.startDate = formattedCriteria.startDate + 'T00:00:00';
      }

      if (formattedCriteria.endDate) {
        formattedCriteria.endDate = formattedCriteria.endDate + 'T23:59:59';
      }

      // Call API to search events
      const response = await searchEvents(formattedCriteria);

      // Check if there is valid response data
      if (response && response.events) {
        setEvents(response.events);
        setPage(newPage);
        setHasMore(response.events.length > 0);
      } else if (Array.isArray(response)) {
        setEvents(response);
        setPage(newPage);
        setHasMore(response.length > 0);
      } else {
        setEvents([]);
        setHasMore(false);
      }

    } catch (error) {
      console.error('Error searching events:', error);
      setError(error.message || 'Failed to search events');
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission from form
  const handleSearch = (criteria) => {
    setSearchParams(criteria);
    performSearch(criteria);
  };

  // Initial load
  useEffect(() => {
    performSearch({});
  }, []);

  // Handle pagination
  const handlePageChange = (direction) => {
    performSearch(searchParams, direction);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      setError('Failed to log out');
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle opening directions modal
  const handleGetDirections = (event) => {
    setSelectedEvent(event);
    setIsDirectionsModalOpen(true);
  };

  // Handle booking event
  const handleBookEvent = (eventId) => {
    // Navigate to booking page with event ID
    navigate(`/book-event/${eventId}`);
  };

  return (
    <div className="dashboard-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl shadow-sm mb-8 mt-4 gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)', borderWidth: '1px' }}>
        <h2 className="m-0" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Events</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/dashboard" className="btn-secondary-action py-2">Dashboard</Link>
          <Link to="/profile" className="btn-secondary-action py-2">Profile</Link>
          <button onClick={handleLogout} className="btn-secondary-action py-2" style={{ color: '#dc2626', borderColor: '#fca5a5', backgroundColor: '#fef2f2' }}>Logout</button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="dashboard-card">
        <div className="dashboard-title">
          <h3>Find Events</h3>
        </div>

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {loading ? (
          <div className="py-8"><SkeletonGrid count={6} /></div>
        ) : (
          <>
            {events.length > 0 ? (
              <div>
                {events.map(event => (
                  <div key={event.eventId} className="event-card" style={{
                    marginBottom: '20px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    gap: '15px'
                  }}>
                    {/* Event Image */}
                    <div style={{ width: '180px', flexShrink: 0 }}>
                      <EventImage
                        eventType={event.eventType}
                        eventTitle={event.title}
                        width="180px"
                        height="150px"
                      />
                    </div>

                    {/* Event Details */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: '10px' }}>{event.title}</h4>

                      <div className="event-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <p><strong>Date:</strong> {formatDate(event.date)}</p>
                          <p><strong>Location:</strong> {event.location}</p>
                          <p><strong>Type:</strong> {event.eventType || 'Not specified'}</p>
                        </div>
                        <div>
                          <p><strong>Status:</strong> <span style={{
                            textTransform: 'capitalize',
                            color: event.status === 'cancelled' ? 'red' :
                              event.status === 'postponed' ? 'orange' :
                                event.status === 'completed' ? 'gray' : 'green'
                          }}>{event.status || 'Upcoming'}</span></p>
                          <p><strong>Age Rating:</strong> {event.ageRating || 'Not specified'}</p>
                          <p><strong>Ticket Price:</strong> {event.ticketPrice} {event.currency || 'USD'}</p>
                          <p><strong>Available Tickets:</strong> {event.totalTickets - (event.bookedTickets || 0)}</p>
                        </div>
                      </div>

                      <div className="event-actions">
                        {/* Modern action buttons using App.css */}
                        <button
                          onClick={() => handleGetDirections(event)}
                          className="btn-secondary-action"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          Get Directions
                        </button>

                        <AboutCityButton
                          city={event.city}
                          className="btn-secondary-action"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {event.city} Info
                        </AboutCityButton>

                        <button
                          onClick={() => handleBookEvent(event.eventId)}
                          className="btn-primary-action"
                          disabled={
                            (event.totalTickets - (event.bookedTickets || 0)) <= 0 ||
                            (event.status === 'cancelled' || event.status === 'completed')
                          }
                        >
                          {(event.totalTickets - (event.bookedTickets || 0)) <= 0 ? 'Sold Out' : 'Book Tickets'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={page === 1}
                    className="btn-secondary-action bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">Page {page}</span>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={!hasMore}
                    className="btn-secondary-action bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                marginTop: '20px'
              }}>
                <p>No events found matching your search criteria.</p>
                <button
                  onClick={() => handleSearch({})}
                  className="btn-primary-action"
                  style={{ marginTop: '10px' }}
                >
                  Show All Events
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Directions Modal */}
      <GetDirectionsModal
        event={selectedEvent}
        isOpen={isDirectionsModalOpen}
        onClose={() => setIsDirectionsModalOpen(false)}
      />
    </div>
  );
}

export default ViewEvents;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, searchEvents, formatDate } from '../api/eventService';
import LoadingSpinner from './common/LoadingSpinner';
import SearchForm from './events/SearchForm';
import GetDirectionsModal from './events/GetDirectionsModal';
import CityInfoModal from './events/CityInfoModal';
import EventImage from './events/EventImage';
import './css/home.css';

function HomeScreen() {
  const navigate = useNavigate();
  
  // State for events data
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Search parameters
  const [searchParams, setSearchParams] = useState({});
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  // Load initial events
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Fetch events from API
  const fetchEvents = async (params = {}, pageDirection = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate page number
      let newPage = page;
      if (pageDirection === 'next') {
        newPage = page + 1;
      } else if (pageDirection === 'prev') {
        newPage = Math.max(1, page - 1);
      } else {
        newPage = 1;
      }
      
      // Format date parameters if they exist
      const formattedParams = { ...params };
      if (formattedParams.startDate) {
        formattedParams.startDate = formattedParams.startDate + 'T00:00:00';
      }
      if (formattedParams.endDate) {
        formattedParams.endDate = formattedParams.endDate + 'T23:59:59';
      }
      
      // Call API
      const response = await searchEvents(formattedParams);
      
      // Process response data
      if (response && response.events) {
        setEvents(response.events);
        setHasMore(response.events.length > 0);
      } else if (Array.isArray(response)) {
        setEvents(response);
        setHasMore(response.length > 0);
      } else {
        setEvents([]);
        setHasMore(false);
      }
      
      setPage(newPage);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search submission
  const handleSearch = (criteria) => {
    setSearchParams(criteria);
    fetchEvents(criteria);
  };
  
  // Handle pagination
  const handlePageChange = (direction) => {
    fetchEvents(searchParams, direction);
  };
  
  // Open directions modal
  const handleGetDirections = (event) => {
    setSelectedEvent(event);
    setIsDirectionsModalOpen(true);
  };
  
  // Open city info modal
  const handleCityInfo = (event) => {
    if (event.city) {
      setSelectedCity(event.city);
      setIsCityModalOpen(true);
    }
  };
  
  // Redirect to login for booking
  const handleLoginToBook = (eventId) => {
    navigate('/login', { state: { redirectTo: `/book-event/${eventId}` } });
  };
  
  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1>FunSpot</h1>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button">Login</Link>
          <Link to="/register" className="auth-button">Register</Link>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {/* Main content */}
      <div className="main-content">
        <div className="search-section">
          <h2>Find Events</h2>
          <SearchForm onSearch={handleSearch} isLoading={loading} />
        </div>
        
        {/* Events display */}
        {loading ? (
          <LoadingSpinner message="Loading events..." />
        ) : (
          <>
            {events.length > 0 ? (
              <>
                <div className="event-grid">
                  {events.map(event => (
                    <div key={event.eventId} className="event-card">
                      {/* Event image - Using actual EventImage component */}
                      <div className="event-image">
                        <EventImage 
                          eventType={event.eventType}
                          eventTitle={event.title} 
                          width="100%"
                          height="180px"
                        />
                      </div>
                      
                      {/* Event content */}
                      <div className="event-content">
                        <h3 className="event-title">{event.title}</h3>
                        
                        <div className="event-details">
                          <p><strong>Date:</strong> {formatDate(event.date)}</p>
                          <p><strong>Location:</strong> {event.location}</p>
                          <p><strong>Type:</strong> {event.eventType || 'Not specified'}</p>
                          <p><strong>Price:</strong> {event.ticketPrice} {event.currency || 'USD'}</p>
                        </div>
                        
                        {/* Action buttons - using smaller styling */}
                        <div className="event-actions">
                          <button 
                            onClick={() => handleGetDirections(event)}
                            className="action-button secondary"
                          >
                            Get Directions
                          </button>
                          
                          {event.city && (
                            <button 
                              onClick={() => handleCityInfo(event)}
                              className="action-button secondary"
                              title={`Information about ${event.city}`}
                            >
                              About City
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleLoginToBook(event.eventId)}
                            className="action-button primary"
                            disabled={
                              (event.totalTickets - (event.bookedTickets || 0)) <= 0 ||
                              (event.status === 'cancelled' || event.status === 'completed')
                            }
                          >
                            Book Tickets
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange('prev')} 
                    disabled={page === 1}
                    className="page-button"
                  >
                    Previous
                  </button>
                  <span className="page-info">Page {page}</span>
                  <button 
                    onClick={() => handlePageChange('next')} 
                    disabled={!hasMore}
                    className="page-button"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="no-events">
                <p>No events found matching your search criteria.</p>
                <button 
                  onClick={() => handleSearch({})} 
                  className="reset-button"
                >
                  Show All Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modals */}
      <GetDirectionsModal
        event={selectedEvent}
        isOpen={isDirectionsModalOpen}
        onClose={() => setIsDirectionsModalOpen(false)}
      />
      
      <CityInfoModal
        city={selectedCity}
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </div>
  );
}

export default HomeScreen;
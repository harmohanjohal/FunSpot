import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventDetails, formatDate } from '../../api/eventService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

function BookEvent() {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [numTickets, setNumTickets] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const eventData = await getEventDetails(eventId);
        
        if (!eventData) {
          setError("Event not found");
          return;
        }
        
        console.log("Event data loaded:", eventData);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);
  
  // Calculate available tickets
  const availableTickets = event ? (event.totalTickets - event.bookedTickets) : 0;
  
  // Handle ticket quantity change
  const handleTicketChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    setNumTickets(Math.max(1, Math.min(value, availableTickets)));
  };
  
  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // Handle proceeding to checkout
  const handleProceedToCheckout = (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to book tickets');
      return;
    }
    
    if (numTickets <= 0) {
      setError('Number of tickets must be at least 1');
      return;
    }
    
    if (numTickets > availableTickets) {
      setError(`Only ${availableTickets} tickets available`);
      return;
    }
    
    try {
      // Navigate to checkout page with event and ticket information
      navigate('/checkout', { 
        state: { 
          event: event,
          numTickets: numTickets
        }
      });
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      setError('Failed to proceed to checkout. Please try again.');
    }
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }
  
  if (error && !event) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Book Event</h2>
          <div className="nav-links">
            <Link to="/events">Back to Events</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
        
        <div className="alert alert-danger">
          {error}
        </div>
        
        <div className="dashboard-card">
          <button onClick={() => navigate('/events')} className="btn">
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Book Event</h2>
          <div className="nav-links">
            <Link to="/events">Back to Events</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
        
        <div className="alert alert-warning">
          Event not found
        </div>
        
        <div className="dashboard-card">
          <button onClick={() => navigate('/events')} className="btn">
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Book Event</h2>
        <div className="nav-links">
          <Link to="/events">Back to Events</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      <div className="dashboard-card">
        <h3 className="dashboard-title">{event.title}</h3>
        
        <div className="event-details" style={{ marginBottom: '20px' }}>
          <p><strong>Date:</strong> {formatDate(event.date)}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Venue:</strong> {event.venueAddress || 'Not specified'}</p>
          <p><strong>Type:</strong> {event.eventType}</p>
          <p><strong>Price:</strong> {event.ticketPrice} {event.currency || 'USD'}</p>
          <p><strong>Available Tickets:</strong> {availableTickets}</p>
          
          {event.description && (
            <div>
              <strong>Description:</strong>
              <p>{event.description}</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleProceedToCheckout}>
          <div className="form-group">
            <label htmlFor="numTickets">Number of Tickets:</label>
            <input
              type="number"
              id="numTickets"
              className="form-control"
              min="1"
              max={availableTickets}
              value={numTickets}
              onChange={handleTicketChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Total Price:</label>
            <p><strong>{(numTickets * event.ticketPrice).toFixed(2)} {event.currency || 'USD'}</strong></p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn"
              disabled={isSubmitting || availableTickets === 0}
            >
              {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/events')}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookEvent;
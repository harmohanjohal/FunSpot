import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents, searchEvents, formatDate } from '../api/eventService';
import { SkeletonGrid } from './common/SkeletonLoader';
import SearchForm from './events/SearchForm';
import GetDirectionsModal from './events/GetDirectionsModal';
import CityInfoModal from './events/CityInfoModal';
import EventImage from './events/EventImage';

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
      setError(err.message || 'Failed to load events. Please try again.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-5 border-b border-slate-700/50 gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight m-0 gradient-text">FunSpot</h1>
        <div className="flex gap-3">
          <Link to="/login" className="btn-primary-action" style={{ margin: 0 }}>Login</Link>
          <Link to="/register" className="btn-secondary-action">Register</Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className={`p-4 mb-6 rounded-xl border font-medium text-sm ${error.includes('refused') || error.includes('not found') ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          <div className="flex items-start">
            <svg className={`w-5 h-5 mr-3 mt-0.5 ${error.includes('refused') ? 'text-amber-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <div>
              <h3 className="text-sm font-bold mb-1">{error.includes('refused') ? 'Service Offline' : 'Error Loading Events'}</h3>
              <p className="text-sm opacity-90">{error}</p>
              {error.includes('refused') && (
                <p className="text-xs opacity-70 mt-2 font-normal">
                  Troubleshooting: Ensure that <strong>run_eventapp.bat</strong>, <strong>run_webservices.bat</strong>, and <strong>run_imageservice.bat</strong> are all running in separate terminal windows.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="w-full">
        <div className="mb-10 p-6 rounded-xl border" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderColor: 'var(--border)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Find Events</h2>
          <SearchForm onSearch={handleSearch} isLoading={loading} />
        </div>

        {/* Events display */}
        {loading ? (
          <div className="py-8"><SkeletonGrid count={8} /></div>
        ) : (
          <>
            {events.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {events.map(event => (
                    <div key={event.eventId} className="flex flex-col rounded-xl overflow-hidden border transform hover:-translate-y-1 transition-all duration-300" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderColor: 'var(--border)' }}>
                      {/* Event image */}
                      <div className="w-full h-48 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                        <EventImage
                          eventType={event.eventType}
                          eventTitle={event.title}
                          width="100%"
                          height="180px"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold mb-3 truncate" style={{ color: 'var(--text-main)' }} title={event.title}>{event.title}</h3>

                        <div className="flex-grow space-y-2 mb-5">
                          <p className="text-sm flex items-center justify-between" style={{ color: 'var(--text-muted)' }}><strong className="font-semibold" style={{ color: 'var(--text-main)' }}>Date:</strong> <span>{formatDate(event.date)}</span></p>
                          <p className="text-sm flex items-center justify-between" style={{ color: 'var(--text-muted)' }}><strong className="font-semibold" style={{ color: 'var(--text-main)' }}>Location:</strong> <span className="text-right truncate max-w-[60%]">{event.location}</span></p>
                          <p className="text-sm flex items-center justify-between" style={{ color: 'var(--text-muted)' }}><strong className="font-semibold" style={{ color: 'var(--text-main)' }}>Type:</strong> <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(58,175,169,0.12)', color: '#2B7A78' }}>{event.eventType || 'Not specified'}</span></p>
                          <p className="text-sm flex items-center justify-between" style={{ color: 'var(--text-muted)' }}><strong className="font-semibold" style={{ color: 'var(--text-main)' }}>Price:</strong> <span className="font-bold" style={{ color: '#2B7A78' }}>{event.ticketPrice} {event.currency || 'USD'}</span></p>
                        </div>

                        {/* Action buttons */}
                        <div className="event-actions" style={{ flexDirection: 'column', marginTop: 'auto', gap: '8px' }}>
                          <button
                            onClick={() => handleLoginToBook(event.eventId)}
                            className="btn-primary-action"
                            style={{ margin: '0', width: '100%', textAlign: 'center', justifyContent: 'center' }}
                            disabled={
                              (event.totalTickets - (event.bookedTickets || 0)) <= 0 ||
                              (event.status === 'cancelled' || event.status === 'completed')
                            }
                          >
                            {(event.totalTickets - (event.bookedTickets || 0)) <= 0 ? 'Sold Out' : 'Book Tickets Now'}
                          </button>

                          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            <button
                              onClick={() => handleGetDirections(event)}
                              className="btn-secondary-action"
                              style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                              Directions
                            </button>

                            {event.city && (
                              <button
                                onClick={() => handleCityInfo(event)}
                                className="btn-secondary-action"
                                style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px' }}
                                title={`Information about ${event.city}`}
                              >
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {event.city} Info
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-8 mb-16">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--bg-input)', border: '1px solid var(--border)' }}>Page {page}</span>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={!hasMore}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4 rounded-xl border border-dashed border-slate-600" style={{ background: 'var(--glass-bg)' }}>
                <p className="text-slate-400 text-lg mb-4">No events found matching your search criteria.</p>
                <button
                  onClick={() => handleSearch({})}
                  className="btn-primary-action"
                  style={{ margin: 0 }}
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
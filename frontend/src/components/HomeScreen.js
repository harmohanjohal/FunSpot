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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200 gap-4">
        <h1 className="text-4xl font-extrabold text-blue-600 m-0 tracking-tight">FunSpot</h1>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors text-sm shadow-sm ring-1 ring-blue-500/50">Login</Link>
          <Link to="/register" className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm shadow-sm border border-gray-300">Register</Link>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="w-full">
        <div className="mb-10 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Events</h2>
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
                    <div key={event.eventId} className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1">
                      {/* Event image - Using actual EventImage component */}
                      <div className="w-full h-48 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <EventImage
                          eventType={event.eventType}
                          eventTitle={event.title}
                          width="100%"
                          height="180px"
                        />
                      </div>

                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 truncate" title={event.title}>{event.title}</h3>

                        <div className="flex-grow space-y-2 mb-5">
                          <p className="text-sm text-gray-600 flex items-center justify-between"><strong className="text-gray-900 font-medium">Date:</strong> <span>{formatDate(event.date)}</span></p>
                          <p className="text-sm text-gray-600 flex items-center justify-between"><strong className="text-gray-900 font-medium">Location:</strong> <span className="text-right truncate max-w-[60%]">{event.location}</span></p>
                          <p className="text-sm text-gray-600 flex items-center justify-between"><strong className="text-gray-900 font-medium">Type:</strong> <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{event.eventType || 'Not specified'}</span></p>
                          <p className="text-sm text-gray-600 flex items-center justify-between"><strong className="text-gray-900 font-medium">Price:</strong> <span className="font-semibold text-green-600">{event.ticketPrice} {event.currency || 'USD'}</span></p>
                        </div>

                        {/* Action buttons - using smaller styling */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleGetDirections(event)}
                            className="flex-1 min-w-0 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
                          >
                            Get Directions
                          </button>

                          {event.city && (
                            <button
                              onClick={() => handleCityInfo(event)}
                              className="flex-1 min-w-0 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
                              title={`Information about ${event.city}`}
                            >
                              About City
                            </button>
                          )}

                          <button
                            onClick={() => handleLoginToBook(event.eventId)}
                            className="flex-shrink-0 w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                <div className="flex justify-center items-center gap-4 mt-8 mb-16">
                  <button
                    onClick={() => handlePageChange('prev')}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">Page {page}</span>
                  <button
                    onClick={() => handlePageChange('next')}
                    disabled={!hasMore}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg mb-4">No events found matching your search criteria.</p>
                <button
                  onClick={() => handleSearch({})}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm"
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
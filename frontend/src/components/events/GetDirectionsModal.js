import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';
import { getDirectionsToEvent } from '../../api/eventService';

function GetDirectionsModal({ event, isOpen, onClose }) {
  const [fromAddress, setFromAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [directions, setDirections] = useState(null);
  const [transportMode, setTransportMode] = useState('driving');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFromAddress('');
      setDirections(null);
      setError(null);
    }
  }, [isOpen]);

  // Transportation mode options
  const transportModes = [
    { value: 'driving', label: 'Driving' },
    { value: 'walking', label: 'Walking' },
    { value: 'transit', label: 'Public Transit' },
    { value: 'bicycling', label: 'Bicycling' }
  ];

  // Handle getting directions
  const handleGetDirections = async (e) => {
    e.preventDefault();

    if (!fromAddress.trim()) {
      setError('Please enter a starting address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the API to get directions
      const response = await getDirectionsToEvent(event.eventId, fromAddress, transportMode);

      if (response && response.success) {
        setDirections(response);
      } else {
        // If the API doesn't return directions, create a fallback with Google Maps link

        // Create destination address from event details
        let destinationAddress = '';

        if (event.venueAddress) {
          destinationAddress = event.venueAddress;
        } else {
          // Build address from available components
          let addressParts = [];
          if (event.location) addressParts.push(event.location);
          if (event.city) addressParts.push(event.city);
          if (event.postcode) addressParts.push(event.postcode);
          destinationAddress = addressParts.join(', ');
        }

        // Create fallback directions object
        setDirections({
          success: true,
          fromAddress: fromAddress,
          toAddress: destinationAddress,
          transportMode: transportMode,
          // Default values if the API doesn't provide them
          distance: "Calculate in Google Maps",
          duration: "Calculate in Google Maps",
          googleMapsUrl: getGoogleMapsDirectionsUrl(fromAddress, destinationAddress, transportMode)
        });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      setError('Failed to get directions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get directions URL for Google Maps
  const getGoogleMapsDirectionsUrl = (from, to, mode) => {
    if (!from || !to) return '';

    const origin = encodeURIComponent(from);
    const destination = encodeURIComponent(to);

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Get Directions"
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="btn-secondary-action"
        >
          Close
        </button>
      }
    >
      <div className="p-2 sm:p-4">
        {/* Event details */}
        {event && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: 'rgba(16, 185, 129, 0.06)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
            <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--text-main)' }}>{event.title}</h4>
            <div className="space-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <p><strong style={{ color: 'var(--text-main)' }}>Venue:</strong> {event.venueAddress || event.location}</p>
              {event.city && <p><strong style={{ color: 'var(--text-main)' }}>City:</strong> {event.city}</p>}
              {event.postcode && <p><strong style={{ color: 'var(--text-main)' }}>Postcode:</strong> {event.postcode}</p>}
            </div>
          </div>
        )}

        {/* User input form */}
        <form onSubmit={handleGetDirections} className="mb-8 space-y-4">
          <div>
            <label htmlFor="fromAddress" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Starting Address or Postcode</label>
            <input
              type="text"
              id="fromAddress"
              className="w-full px-4 py-2.5 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Enter your location..."
              required
            />
          </div>

          <div>
            <label htmlFor="transportMode" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Transportation</label>
            <select
              id="transportMode"
              className="w-full px-4 py-2.5 border text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{ background: 'var(--bg-input)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
            >
              {transportModes.map(mode => (
                <option key={mode.value} value={mode.value} style={{ background: 'var(--bg-card-solid)', color: 'var(--text-main)' }}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !fromAddress.trim()}
            className="btn-primary-action w-full mt-2 py-3 flex items-center justify-center gap-2"
            style={{ margin: 0 }}
          >
            {loading ? (
              <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Getting Directions...</>
            ) : 'Get Directions'}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-6 rounded-lg border text-sm font-medium" style={{ background: 'var(--danger-bg)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Loading spinner */}
        {loading && <div className="py-8 flex justify-center"><LoadingSpinner message="Getting directions..." /></div>}

        {/* Directions results */}
        {directions && !loading && (
          <div className="rounded-xl overflow-hidden border animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-strong)' }}>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b" style={{ background: 'rgba(12,15,20,0.5)', borderColor: 'var(--border)' }}>
              <div className="space-y-2">
                <p><strong style={{ color: 'var(--text-main)' }}>From:</strong> <span style={{ color: 'var(--text-muted)' }}>{directions.fromAddress}</span></p>
                <p><strong style={{ color: 'var(--text-main)' }}>To:</strong> <span style={{ color: 'var(--text-muted)' }}>{directions.toAddress || event.location}</span></p>
              </div>
              <div className="space-y-2">
                <p><strong className="capitalize flex items-center gap-1" style={{ color: 'var(--text-main)' }}>
                  <svg className="w-4 h-4" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  {directions.transportMode || transportMode}
                </strong></p>

                {directions.distance && directions.distance !== "Calculate in Google Maps" && (
                  <p><strong style={{ color: 'var(--text-main)' }}>Distance:</strong> <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{directions.distance}</span></p>
                )}

                {directions.duration && directions.duration !== "Calculate in Google Maps" && (
                  <p><strong style={{ color: 'var(--text-main)' }}>Estimated Time:</strong> <span className="font-semibold" style={{ color: '#3AAFA9' }}>{directions.duration}</span></p>
                )}
              </div>
            </div>

            {/* Step-by-step directions */}
            {directions.directions && directions.directions.length > 0 && (
              <div className="p-5">
                <h4 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                  <svg className="w-5 h-5" style={{ color: 'var(--text-faint)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                  Step-by-Step Directions
                </h4>
                <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  <ol className="relative ml-3 space-y-4" style={{ borderLeft: '1px solid var(--border)' }}>
                    {directions.directions.map((step, index) => (
                      <li key={index} className="pl-6 relative group">
                        <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 text-xs font-bold text-white" style={{ background: 'var(--accent-gradient)' }}>{index + 1}</span>
                        <div className="p-3 rounded-lg transition-colors" style={{ background: 'rgba(16,185,129,0.04)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: step.instruction }}></p>
                          {step.distance && (
                            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
                              {step.distance}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Google Maps Link */}
            <div className="p-5 text-center border-t" style={{ borderColor: 'var(--border)', background: 'rgba(12,15,20,0.5)' }}>
              <a
                href={directions.googleMapsUrl || getGoogleMapsDirectionsUrl(
                  directions.fromAddress,
                  directions.toAddress || (event.venueAddress || event.location + ', ' + event.city),
                  directions.transportMode || transportMode
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 text-white font-bold rounded-lg transition-colors shadow-sm"
                style={{ background: 'linear-gradient(135deg, #3AAFA9, #2B7A78)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Open in Google Maps
              </a>
              <p className="mt-3 text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
                Opens a new tab with interactive navigation
              </p>
            </div>

            {/* Extra Close button at the bottom for easier access */}
            <div className="p-4 text-center sm:hidden" style={{ background: 'var(--bg-card-solid)' }}>
              <button
                onClick={onClose}
                className="btn-secondary-action w-full"
              >
                Close Dialog
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default GetDirectionsModal;
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
          className="btn"
          style={{ 
            padding: '8px 16px', 
            fontSize: '14px',
            backgroundColor: '#1da1f2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      }
    >
      <div className="directions-modal-content">
        {/* Event details */}
        {event && (
          <div className="event-details" style={{ marginBottom: '15px' }}>
            <h4>{event.title}</h4>
            <p><strong>Venue:</strong> {event.venueAddress || event.location}</p>
            {event.city && <p><strong>City:</strong> {event.city}</p>}
            {event.postcode && <p><strong>Postcode:</strong> {event.postcode}</p>}
          </div>
        )}
        
        {/* User input form */}
        <form onSubmit={handleGetDirections} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label htmlFor="fromAddress">Starting Address or Postcode</label>
            <input
              type="text"
              id="fromAddress"
              className="form-control"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Enter your location..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="transportMode">Transportation</label>
            <select
              id="transportMode"
              className="form-control"
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
            >
              {transportModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            disabled={loading || !fromAddress.trim()}
            style={{ 
              marginTop: '10px', 
              width: '100%',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#1da1f2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Getting Directions...' : 'Get Directions'}
          </button>
        </form>
        
        {/* Error message */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        {/* Loading spinner */}
        {loading && <LoadingSpinner message="Getting directions..." />}
        
        {/* Directions results */}
        {directions && !loading && (
          <div className="directions-results">
            <div className="directions-summary" style={{ 
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: '#f5f8fa',
              borderRadius: '5px'
            }}>
              <p><strong>From:</strong> {directions.fromAddress}</p>
              <p><strong>To:</strong> {directions.toAddress || event.location}</p>
              <p><strong>Transportation:</strong> {directions.transportMode || transportMode}</p>
              
              {directions.distance && directions.distance !== "Calculate in Google Maps" && (
                <p><strong>Distance:</strong> {directions.distance}</p>
              )}
              
              {directions.duration && directions.duration !== "Calculate in Google Maps" && (
                <p><strong>Estimated Time:</strong> {directions.duration}</p>
              )}
            </div>
            
            {/* Step-by-step directions */}
            {directions.directions && directions.directions.length > 0 && (
              <div className="directions-steps">
                <h4>Step-by-Step Directions:</h4>
                <div className="directions-list-container" style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  border: '1px solid #eaeaea',
                  borderRadius: '5px',
                  padding: '10px'
                }}>
                  <ol style={{ paddingLeft: '20px', margin: '0' }}>
                    {directions.directions.map((step, index) => (
                      <li key={index} style={{ marginBottom: '12px', lineHeight: '1.4' }}>
                        {step.instruction}
                        {step.distance && (
                          <span style={{ 
                            color: '#657786', 
                            fontSize: '14px',
                            marginLeft: '5px'
                          }}> 
                            ({step.distance})
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
            
            {/* Google Maps Link */}
            <div className="map-container" style={{ marginTop: '20px', textAlign: 'center' }}>
              <a 
                href={directions.googleMapsUrl || getGoogleMapsDirectionsUrl(
                  directions.fromAddress, 
                  directions.toAddress || (event.venueAddress || event.location + ', ' + event.city),
                  directions.transportMode || transportMode
                )} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn"
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  backgroundColor: '#1da1f2',
                  color: 'white',
                  textDecoration: 'none',
                  display: 'inline-block',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Open Directions in Google Maps
              </a>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#657786' }}>
                Click the button above to open these directions in Google Maps in a new tab
              </p>
            </div>
            
            {/* Extra Close button at the bottom for easier access */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={onClose} 
                className="btn"
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '14px',
                  backgroundColor: '#657786',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default GetDirectionsModal;
import React, { useState } from 'react';
import GetDirectionsModal from './GetDirectionsModal';


function GetDirectionsButton({ event, className = "action-button secondary", style = {} }) {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Make sure there is an event with location data
  if (!event) {
    return null;
  }
  
  // Check if there is at least some address information
  const hasLocationInfo = event.location || event.venueAddress || 
                         (event.city && event.postcode);
  
  if (!hasLocationInfo) {
    return null; // Don't render button if no location info available
  }
  
  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className={className}
        style={style}
        disabled={!hasLocationInfo}
      >
        Get Directions
      </button>
      
      {/* Modal component that appears when the button is clicked */}
      <GetDirectionsModal 
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default GetDirectionsButton;
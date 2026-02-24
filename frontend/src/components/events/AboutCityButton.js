import React, { useState } from 'react';
import CityInfoModal from './CityInfoModal';

function AboutCityButton({ city, className = "action-button secondary", style = {}, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Only show button if city exists
  if (!city) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
        style={style}
        title={`Learn about ${city}`}
      >
        {children || "About City"}
      </button>

      <CityInfoModal
        city={city}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export default AboutCityButton;
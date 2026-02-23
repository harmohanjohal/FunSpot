import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

function CityInfoModal({ city, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityFacts, setCityFacts] = useState([]);

  useEffect(() => {
    if (isOpen && city) {
      fetchCityInfo(city);
    }
  }, [isOpen, city]);

  const fetchCityInfo = async (cityName) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the backend API
      const response = await fetch(`http://localhost:8081/api/events/city-info?city=${encodeURIComponent(cityName)}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCityFacts(data.facts || []);
      } else {
        setError(data.error || `No information found for ${cityName}`);
        setCityFacts([]);
      }
    } catch (error) {
      console.error('Error fetching city information:', error);
      setError(`Failed to load information about ${cityName}`);
      setCityFacts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`About ${city}`}
      onClose={onClose}
      footer={
        <button onClick={onClose} className="btn">Close</button>
      }
    >
      <div className="city-info-content">
        {loading ? (
          <LoadingSpinner message={`Loading information about ${city}...`} />
        ) : error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : cityFacts.length > 0 ? (
          <div>
            <h4>Interesting Facts:</h4>
            <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
              {cityFacts.map((fact, index) => (
                <li key={index} style={{ marginBottom: '10px' }}>
                  {fact}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="alert alert-warning">
            No information available for {city}.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CityInfoModal;
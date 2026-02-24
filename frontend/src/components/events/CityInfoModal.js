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
      <div className="p-4">
        {loading ? (
          <div className="py-8 flex justify-center"><LoadingSpinner message={`Loading information about ${city}...`} /></div>
        ) : error ? (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
            {error}
          </div>
        ) : cityFacts.length > 0 ? (
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Interesting Facts:
            </h4>
            <ol className="list-decimal pl-5 space-y-3 text-gray-700">
              {cityFacts.map((fact, index) => (
                <li key={index} className="leading-relaxed">
                  {fact}
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 font-medium text-center">
            No information available for {city}.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CityInfoModal;
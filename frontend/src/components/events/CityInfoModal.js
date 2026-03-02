import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { API_CONFIG } from '../../config';

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
      const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:8081/api';
      const response = await fetch(`${baseUrl}/events/city-info?city=${encodeURIComponent(cityName)}`);

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
        <button
          onClick={onClose}
          className="px-6 py-2.5 text-white font-semibold rounded-lg transition-all text-sm shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #3AAFA9, #2B7A78)',
            boxShadow: '0 4px 12px rgba(58, 175, 169, 0.3)',
          }}
        >
          Close
        </button>
      }
    >
      <div>
        {loading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner message={`Loading information about ${city}...`} />
          </div>
        ) : error ? (
          <div
            className="p-4 rounded-xl border text-sm font-medium flex items-center gap-3"
            style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        ) : cityFacts.length > 0 ? (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-strong)' }}
          >
            {/* Facts header stripe */}
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ background: 'rgba(58,175,169,0.1)', borderBottom: '1px solid var(--border)' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3AAFA9' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-base font-bold m-0" style={{ color: '#2B7A78' }}>
                Interesting Facts about {city}
              </h4>
            </div>

            {/* Fact items */}
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {cityFacts.map((fact, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{ background: index % 2 === 0 ? 'var(--bg-page)' : 'var(--bg-elevated)' }}
                >
                  {/* Numbered badge */}
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #3AAFA9, #2B7A78)' }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm leading-relaxed m-0" style={{ color: 'var(--text-muted)' }}>
                    {fact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="p-5 rounded-xl border text-center text-sm font-medium"
            style={{ background: 'var(--warning-bg)', borderColor: 'rgba(230,81,0,0.25)', color: 'var(--warning)' }}
          >
            No information available for {city}.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default CityInfoModal;
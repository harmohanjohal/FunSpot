// src/components/common/QRCodeDisplay.js
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

const QRCodeDisplay = ({ bookingReference, eventTitle, eventDate, numTickets, username }) => {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      if (!bookingReference) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Format date for API
        const formattedDate = eventDate ? encodeURIComponent(eventDate) : '';

        // Use the hardcoded value as a fallback when environment variable is not available
        const imageServiceUrl = process.env.REACT_APP_IMAGE_SERVICE_URL || "http://localhost:8083/api";

        // Build API URL with the image service URL
        const apiUrl = `${imageServiceUrl}/images/qrcode?ref=${encodeURIComponent(bookingReference)}`;
        const params = new URLSearchParams();
        if (eventTitle) params.append('event', eventTitle);
        if (formattedDate) params.append('date', formattedDate);
        if (numTickets) params.append('tickets', numTickets);
        if (username) params.append('user', username);

        // Append parameters to URL
        const fullUrl = `${apiUrl}&${params.toString()}`;

        console.log("Fetching QR code from:", fullUrl);

        // Fetch QR code from backend
        const response = await fetch(fullUrl);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.qrCode) {
          console.log("QR code received successfully");
          setQrCode(data.qrCode);
        } else {
          console.error("API returned success=false or no QR code");
          setError(data.error || 'Failed to generate QR code');
        }
      } catch (error) {
        console.error('Error fetching QR code:', error);
        setError('Error loading QR code: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [bookingReference, eventTitle, eventDate, numTickets, username]);

  if (loading) {
    return <LoadingSpinner message="Generating QR Code..." />;
  }

  if (error) {
    return (
      <div className="error-message" style={{
        padding: '15px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '5px',
        marginTop: '15px',
        textAlign: 'center'
      }}>
        <p>Error generating QR code:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div style={{
        textAlign: 'center',
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        QR Code not available
      </div>
    );
  }

  return (
    <div className="qr-code-container" style={{ textAlign: 'center', marginTop: '15px' }}>
      <div style={{
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '5px',
        display: 'inline-block',
        backgroundColor: 'white'
      }}>
        <img
          src={`data:image/png;base64,${qrCode}`}
          alt="Booking QR Code"
          style={{
            width: '200px',
            height: '200px'
          }}
        />
        <p style={{ marginTop: '10px', fontSize: '12px' }}>
          Booking Ref: {bookingReference}
        </p>
      </div>
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#657786' }}>
        Show this at the venue for entry
      </p>
    </div>
  );
};

export default QRCodeDisplay;
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import QRCodeDisplay from '../common/QRCodeDisplay';

function BookingSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventTitle, bookingReference, numTickets, totalPrice, currency, eventDate, username } = location.state || {};
  
  // If no booking data, redirect to dashboard after showing loading for a moment
  useEffect(() => {
    if (!eventTitle || !bookingReference) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [eventTitle, bookingReference, navigate]);
  
  // If no booking data, show loading until redirect happens
  if (!eventTitle || !bookingReference) {
    return <LoadingSpinner message="Loading your booking information..." />;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ 
          color: '#17bf63', 
          fontSize: '48px', 
          marginBottom: '20px' 
        }}>
          ✓
        </div>
        
        <h2 style={{ color: '#17bf63', marginBottom: '20px' }}>Booking Successful!</h2>
        
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Your tickets for <strong>{eventTitle}</strong> have been booked successfully.
        </p>
        
        <div style={{ 
          background: '#f5f8fa', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ color: '#657786', fontSize: '14px' }}>Booking Reference</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{bookingReference}</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0' }}>
            <div>
              <div style={{ color: '#657786', fontSize: '14px' }}>Number of Tickets</div>
              <div>{numTickets}</div>
            </div>
            
            <div>
              <div style={{ color: '#657786', fontSize: '14px' }}>Total Price</div>
              <div>{totalPrice} {currency}</div>
            </div>
          </div>
        </div>
        
        {/* QR Code */}
        <QRCodeDisplay 
          bookingReference={bookingReference}
          eventTitle={eventTitle}
          eventDate={eventDate}
          numTickets={numTickets}
          username={username}
        />
        
        <p style={{ marginBottom: '30px', marginTop: '20px' }}>
          You can view this booking in your dashboard under "My Bookings".
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <Link to="/dashboard" className="btn">
            View My Bookings
          </Link>
          <Link to="/events" className="btn btn-secondary">
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
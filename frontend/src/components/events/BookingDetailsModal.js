import React from 'react';
import Modal from '../common/Modal';
import { formatDate } from '../../api/eventService';
import QRCodeDisplay from '../common/QRCodeDisplay';

function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!booking) return null;

  // Check if it's an upcoming booking (to only show QR code for upcoming events)
  const isUpcoming = new Date(booking.eventDate) > new Date();
  const isActive = booking.status !== 'cancelled';

  return (
    <Modal
      isOpen={isOpen}
      title="Booking Details"
      onClose={onClose}
      footer={
        <button onClick={onClose} className="btn">Close</button>
      }
    >
      <div className="booking-details-content">
        <h3 style={{ marginBottom: '15px' }}>{booking.eventTitle}</h3>
        
        <div className="detail-section" style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Event Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>Date:</strong> {formatDate(booking.eventDate)}</p>
            <p><strong>Location:</strong> {booking.location}</p>
          </div>
        </div>
        
        <div className="detail-section" style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>Booking Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <p><strong>Booking Reference:</strong> {booking.bookingReference}</p>
            <p><strong>Status:</strong> <span style={{
              color: booking.status === 'cancelled' ? 'red' : 
                    booking.status === 'pending' ? 'orange' : 'green',
              fontWeight: 'bold'
            }}>{booking.status}</span></p>
            <p><strong>Number of Tickets:</strong> {booking.numTickets}</p>
            <p><strong>Total Price:</strong> {booking.totalPrice} {booking.currency}</p>
            {booking.bookingDate && (
              <p><strong>Booking Date:</strong> {formatDate(booking.bookingDate)}</p>
            )}
          </div>
        </div>
        
        {/* QR Code - Only show for upcoming events */}
        {isUpcoming && isActive && (
          <QRCodeDisplay 
            bookingReference={booking.bookingReference}
            eventTitle={booking.eventTitle}
            eventDate={booking.eventDate}
            numTickets={booking.numTickets}
            username={booking.username}
          />
        )}
      </div>
    </Modal>
  );
}

export default BookingDetailsModal;
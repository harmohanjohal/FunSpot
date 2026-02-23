import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, cancelBooking, submitReview } from '../../api/userBookingService';
import { formatDate } from '../../api/eventService';
import LoadingSpinner from '../common/LoadingSpinner';
import DataCard from '../common/DataCard';
import BookingDetailsModal from '../events/BookingDetailsModal';
import EventReviewModal from '../events/EventReviewModal';
import GetDirectionsButton from '../events/GetDirectionsButton';
import useAlert from '../../hooks/useAlert';

function UserDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Selected booking for details modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Selected booking for review modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Alerts
  const { alert, showSuccess, showError, clearAlert } = useAlert();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch bookings
        const bookings = await getUserBookings(currentUser.uid);
        setUserBookings(bookings);
        
        // Get user profile from Firebase
        const db = window.firebase?.firestore?.();
        if (db) {
          const userDoc = await db.collection('users').doc(currentUser.uid).get();
          if (userDoc.exists) {
            setUserProfile(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  // Filter bookings based on active tab
  const filteredBookings = userBookings.filter(booking => {
    const eventDate = new Date(booking.eventDate);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return eventDate >= today && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return eventDate < today && booking.status !== 'cancelled';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true; // 'all' tab
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      setError('Failed to log out');
    }
  };
  
  // Handle opening booking details modal
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };
  
  // Handle closing booking details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };
  
  // Handle opening review modal
  const handleOpenReviewModal = (booking) => {
    setReviewBooking(booking);
    setIsReviewModalOpen(true);
  };
  
  // Handle closing review modal
  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewBooking(null);
  };
  
  // Handle booking cancellation
  const handleCancelBooking = async (booking) => {
    try {
      if (!booking || !booking.bookingReference) {
        showError('Invalid booking reference');
        return;
      }
      
      // Confirm cancellation
      if (!window.confirm(`Are you sure you want to cancel your booking for "${booking.eventTitle}"?`)) {
        return;
      }
      
      setLoading(true);
      
      // Call the cancelBooking function - this will update both Firebase and the backend API
      const result = await cancelBooking(currentUser.uid, booking.bookingReference);
      
      if (result && result.success) {
        // Update the local bookings list
        setUserBookings(prevBookings => 
          prevBookings.map(b => 
            b.bookingReference === booking.bookingReference 
              ? { ...b, status: 'cancelled' } 
              : b
          )
        );
        
        // Show a success message that includes information about the refund
        showSuccess(`Booking cancelled successfully. ${booking.numTickets} tickets have been returned to available pool.`);
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Failed to cancel booking: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async (reviewData) => {
    try {
      setLoading(true);
      
      // Call the submitReview function
      await submitReview(currentUser.uid, reviewData);
      
      // Update the local bookings list
      setUserBookings(prevBookings => 
        prevBookings.map(b => 
          b.bookingReference === reviewData.bookingReference 
            ? { 
                ...b, 
                review: {
                  rating: reviewData.rating,
                  comment: reviewData.comment,
                  reviewDate: reviewData.reviewDate
                },
                reviewed: true
              } 
            : b
        )
      );
      
      showSuccess('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review: ' + error.message);
      throw error; // Rethrow to handle in the modal
    } finally {
      setLoading(false);
    }
  };

  // Get count of bookings by status
  const upcomingCount = userBookings.filter(b => new Date(b.eventDate) >= new Date() && b.status !== 'cancelled').length;
  const pastCount = userBookings.filter(b => new Date(b.eventDate) < new Date() && b.status !== 'cancelled').length;
  const cancelledCount = userBookings.filter(b => b.status === 'cancelled').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>User Dashboard</h2>
        <div className="nav-links">
          <Link to="/profile">Profile</Link>
          <Link to="/events">View Events</Link>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* User Profile Card */}
        <DataCard title="User Profile">
          {loading ? (
            <LoadingSpinner message="Loading profile..." />
          ) : (
            <div className="user-profile">
              <div className="profile-avatar" style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#1da1f2', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 15px auto'
              }}>
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
                {userProfile?.name || currentUser?.email}
              </h3>
              
              <p style={{ textAlign: 'center', color: '#657786', marginBottom: '20px' }}>
                {userProfile?.username || 'User'}
              </p>
              
              <div className="profile-details">
                <p><strong>Email:</strong> {currentUser?.email}</p>
                {userProfile?.phoneNumber && (
                <p><strong>Phone:</strong> {userProfile.phoneNumber}</p>
                )}
                
              </div>
              
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/profile" className="btn">Edit Profile</Link>
              </div>
            </div>
          )}
        </DataCard>
        
        {/* Dashboard Summary */}
        <DataCard title="Quick Statistics">
          <div className="stats-container" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px'
          }}>
            <div className="stat-box" style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#e8f5fd',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '28px', color: '#1da1f2' }}>{upcomingCount}</h3>
              <p style={{ color: '#657786' }}>Upcoming Events</p>
            </div>
            
            <div className="stat-box" style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#f5f8fa',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '28px', color: '#657786' }}>{pastCount}</h3>
              <p style={{ color: '#657786' }}>Past Events</p>
            </div>
            
            <div className="stat-box" style={{
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#fdeded',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '28px', color: '#e0245e' }}>{cancelledCount}</h3>
              <p style={{ color: '#657786' }}>Cancelled Bookings</p>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Link to="/events" className="btn">Browse Events</Link>
          </div>
        </DataCard>
      </div>

      {/* Bookings Section */}
      <DataCard title="My Bookings">
        {/* Tabs */}
        <div className="tabs" style={{ 
          display: 'flex', 
          borderBottom: '1px solid #eee',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            style={{
              padding: '10px 15px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? '2px solid #1da1f2' : '2px solid transparent',
              color: activeTab === 'upcoming' ? '#1da1f2' : '#657786',
              fontWeight: activeTab === 'upcoming' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Upcoming ({upcomingCount})
          </button>
          
          <button
            onClick={() => setActiveTab('past')}
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            style={{
              padding: '10px 15px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'past' ? '2px solid #1da1f2' : '2px solid transparent',
              color: activeTab === 'past' ? '#1da1f2' : '#657786',
              fontWeight: activeTab === 'past' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Past ({pastCount})
          </button>
          
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
            style={{
              padding: '10px 15px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'cancelled' ? '2px solid #1da1f2' : '2px solid transparent',
              color: activeTab === 'cancelled' ? '#1da1f2' : '#657786',
              fontWeight: activeTab === 'cancelled' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            Cancelled ({cancelledCount})
          </button>
          
          <button
            onClick={() => setActiveTab('all')}
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            style={{
              padding: '10px 15px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid #1da1f2' : '2px solid transparent',
              color: activeTab === 'all' ? '#1da1f2' : '#657786',
              fontWeight: activeTab === 'all' ? 'bold' : 'normal',
              cursor: 'pointer'
            }}
          >
            All ({userBookings.length})
          </button>
        </div>
        
        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : filteredBookings.length > 0 ? (
          <div>
            {filteredBookings.map((booking, index) => (
              <div key={index} className="booking-card" style={{ 
                marginBottom: '15px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
                display: 'grid', 
                gridTemplateColumns: '1fr 120px',
                gap: '15px'
              }}>
                <div className="booking-details">
                  <h4 style={{ marginBottom: '10px' }}>{booking.eventTitle}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <p><strong>Date:</strong> {formatDate(booking.eventDate)}</p>
                      <p><strong>Location:</strong> {booking.location}</p>
                      <p><strong>Booking Ref:</strong> {booking.bookingReference}</p>
                    </div>
                    <div>
                      <p><strong>Tickets:</strong> {booking.numTickets}</p>
                      <p><strong>Total Price:</strong> {booking.totalPrice} {booking.currency}</p>
                      <p><strong>Status:</strong> <span style={{
                        color: booking.status === 'cancelled' ? 'red' : 
                               booking.status === 'pending' ? 'orange' : 'green',
                        fontWeight: 'bold'
                      }}>{booking.status}</span></p>
                    </div>
                  </div>
                  
                  {/* Show Get Directions button for upcoming events */}
                  {new Date(booking.eventDate) > new Date() && booking.status !== 'cancelled' && (
                    <div style={{ marginTop: '10px' }}>
                      <GetDirectionsButton 
                        event={{
                          eventId: booking.eventId,
                          title: booking.eventTitle,
                          location: booking.location,
                          venueAddress: booking.venueAddress,
                          city: booking.city,
                          postcode: booking.postcode
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '14px', padding: '5px 10px' }}
                      />
                    </div>
                  )}
                  
                  {/* Show review badge if the booking has been reviewed */}
                  {booking.reviewed && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '5px 10px', 
                      backgroundColor: '#f2f9fe', 
                      borderRadius: '5px',
                      display: 'inline-block'
                    }}>
                      <span style={{ color: '#1da1f2', fontWeight: 'bold' }}>
                        ★ {booking.review?.rating || '5'} - Reviewed
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="booking-actions" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {/* Upcoming event actions */}
                  {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                    <>
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="btn btn-secondary" 
                        style={{ marginBottom: '10px', fontSize: '14px', padding: '8px 12px' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleCancelBooking(booking)}
                        className="btn btn-danger" 
                        style={{ fontSize: '14px', padding: '8px 12px' }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {/* Past event actions */}
                  {activeTab === 'past' && !booking.reviewed && (
                    <>
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="btn btn-secondary" 
                        style={{ marginBottom: '10px', fontSize: '14px', padding: '8px 12px' }}
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleOpenReviewModal(booking)}
                        className="btn" 
                        style={{ fontSize: '14px', padding: '8px 12px' }}
                      >
                        Leave Review
                      </button>
                    </>
                  )}
                  
                  {/* Past reviewed event actions */}
                  {activeTab === 'past' && booking.reviewed && (
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '14px', padding: '8px 12px' }}
                    >
                      View Details
                    </button>
                  )}
                  
                  {/* Cancelled event actions */}
                  {(activeTab === 'cancelled' || (activeTab === 'all' && booking.status === 'cancelled')) && (
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="btn btn-secondary" 
                      style={{ fontSize: '14px', padding: '8px 12px' }}
                    >
                      View Details
                    </button>
                  )}
                  
                  {/* All tab - show different actions based on status */}
                  {activeTab === 'all' && booking.status !== 'cancelled' && (
                    <>
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="btn btn-secondary" 
                        style={{ marginBottom: '10px', fontSize: '14px', padding: '8px 12px' }}
                      >
                        View Details
                      </button>
                      
                      {/* For past events that haven't been reviewed */}
                      {new Date(booking.eventDate) < new Date() && !booking.reviewed && (
                        <button 
                          onClick={() => handleOpenReviewModal(booking)}
                          className="btn" 
                          style={{ fontSize: '14px', padding: '8px 12px' }}
                        >
                          Leave Review
                        </button>
                      )}
                      
                      {/* For upcoming events */}
                      {new Date(booking.eventDate) >= new Date() && (
                        <button 
                          onClick={() => handleCancelBooking(booking)}
                          className="btn btn-danger" 
                          style={{ fontSize: '14px', padding: '8px 12px' }}
                        >
                          Cancel
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>You don't have any {activeTab} bookings.</p>
            {activeTab !== 'all' && (
              <button onClick={() => setActiveTab('all')} className="btn btn-secondary" style={{ marginTop: '10px' }}>
                View All Bookings
              </button>
            )}
            {userBookings.length === 0 && (
              <Link to="/events" className="btn" style={{ marginTop: '10px', marginLeft: '10px' }}>
                Browse Events
              </Link>
            )}
          </div>
        )}
      </DataCard>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
      
      {/* Event Review Modal */}
      <EventReviewModal
        booking={reviewBooking}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}

export default UserDashboard;
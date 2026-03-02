import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, cancelBooking, submitReview } from '../../api/userBookingService';
import { formatDate } from '../../api/eventService';
import { SkeletonRow } from '../common/SkeletonLoader';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-xl mb-8 mt-4 gap-4 border" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderColor: 'var(--glass-border)' }}>
        <h2 className="text-2xl font-extrabold m-0 gradient-text">User Dashboard</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Link to="/profile" className="btn-secondary-action py-2">Profile</Link>
          <Link to="/events" className="btn-secondary-action py-2">View Events</Link>
          <button onClick={handleLogout} className="btn-danger-action py-2" style={{ padding: '8px 16px', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg border font-medium flex items-center gap-2" style={{ background: 'var(--danger-bg)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {alert.show && (
        <div className={`p-4 mb-6 rounded-lg border font-medium flex items-center gap-2`} style={{
          background: alert.type === 'danger' ? 'var(--danger-bg)' : alert.type === 'success' ? 'var(--success-bg)' : 'rgba(58,175,169,0.1)',
          borderColor: alert.type === 'danger' ? 'rgba(239,68,68,0.2)' : alert.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(58,175,169,0.2)',
          color: alert.type === 'danger' ? '#fca5a5' : alert.type === 'success' ? '#86efac' : '#5EC8C2'
        }}>
          {alert.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <DataCard title="User Profile">
            {loading ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-24 h-24 rounded-full mb-4" style={{ background: 'rgba(138,143,152,0.15)' }}></div>
                <div className="h-6 w-32 rounded mb-2" style={{ background: 'rgba(138,143,152,0.15)' }}></div>
                <div className="h-4 w-24 rounded mb-6" style={{ background: 'rgba(138,143,152,0.15)' }}></div>
                <div className="w-full space-y-3 p-4 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="h-10 w-full rounded" style={{ background: 'rgba(138,143,152,0.15)' }}></div>
                  <div className="h-10 w-full rounded" style={{ background: 'rgba(138,143,152,0.15)' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full text-white flex items-center justify-center text-3xl font-bold mb-4 border-4" style={{ background: 'var(--accent-gradient)', borderColor: 'var(--bg-card-solid)', boxShadow: 'var(--shadow-md)' }}>
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <h3 className="text-xl font-bold text-center mb-1" style={{ color: 'var(--text-main)' }}>
                  {userProfile?.name || currentUser?.email}
                </h3>

                <p className="text-center mb-6 font-medium" style={{ color: 'var(--text-faint)' }}>
                  @{userProfile?.username || 'user'}
                </p>

                <div className="w-full space-y-3 p-4 rounded-xl border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Email</p>
                      <p className="font-medium break-all" style={{ color: 'var(--text-main)' }}>{currentUser?.email}</p>
                    </div>
                  </div>

                  {userProfile?.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-faint)' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Phone</p>
                        <p className="font-medium" style={{ color: 'var(--text-main)' }}>{userProfile.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 w-full text-center">
                  <Link to="/profile" className="btn-secondary-action inline-block w-full py-2.5">
                    Edit Profile Information
                  </Link>
                </div>
              </div>
            )}
          </DataCard>
        </div>

        {/* Dashboard Summary */}
        <div className="lg:col-span-2">
          <DataCard title="Dashboard Summary">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-xl text-center transition-transform hover:-translate-y-1 duration-300 border" style={{ background: 'rgba(58, 175, 169, 0.08)', borderColor: 'rgba(58, 175, 169, 0.2)' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(58, 175, 169, 0.15)', color: '#3AAFA9' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#3AAFA9' }}>{upcomingCount}</h3>
                <p className="font-medium text-sm mt-1" style={{ color: '#2B7A78' }}>Upcoming Events</p>
              </div>

              <div className="p-5 rounded-xl text-center transition-transform hover:-translate-y-1 duration-300 border" style={{ background: 'rgba(138,143,152,0.06)', borderColor: 'var(--border-strong)' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(138,143,152,0.1)', color: 'var(--text-muted)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--text-muted)' }}>{pastCount}</h3>
                <p className="font-medium text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Past Events</p>
              </div>

              <div className="p-5 rounded-xl text-center transition-transform hover:-translate-y-1 duration-300 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold" style={{ color: '#fca5a5' }}>{cancelledCount}</h3>
                <p className="font-medium text-sm mt-1" style={{ color: '#ef4444' }}>Cancelled</p>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Link to="/events" className="btn-primary-action inline-flex items-center gap-2 px-6 py-3" style={{ margin: 0 }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                Find More Events
              </Link>
            </div>
          </DataCard>
        </div>
      </div>

      {/* Bookings Section */}
      <DataCard title="My Bookings">
        {/* Tabs */}
        <div className="flex mb-6 overflow-x-auto custom-scrollbar border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors border-b-2 outline-none ${activeTab === 'upcoming'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent hover:border-gray-600'
              }`}
            style={activeTab === 'upcoming' ? { background: 'rgba(16,185,129,0.06)' } : { color: 'var(--text-faint)' }}
          >
            Upcoming ({upcomingCount})
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors border-b-2 outline-none ${activeTab === 'past'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent hover:border-gray-600'
              }`}
            style={activeTab === 'past' ? { background: 'rgba(16,185,129,0.06)' } : { color: 'var(--text-faint)' }}
          >
            Past ({pastCount})
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors border-b-2 outline-none ${activeTab === 'cancelled'
              ? 'border-red-400 text-red-400'
              : 'border-transparent hover:border-gray-600'
              }`}
            style={activeTab === 'cancelled' ? { background: 'rgba(239,68,68,0.06)' } : { color: 'var(--text-faint)' }}
          >
            Cancelled ({cancelledCount})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors border-b-2 outline-none ${activeTab === 'all'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent hover:border-gray-600'
              }`}
            style={activeTab === 'all' ? { background: 'rgba(245,158,11,0.06)' } : { color: 'var(--text-faint)' }}
          >
            All ({userBookings.length})
          </button>
        </div>

        {loading ? (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full" style={{ borderColor: 'var(--border)' }}>
              <tbody>
                <SkeletonRow columns={5} />
                <SkeletonRow columns={5} />
                <SkeletonRow columns={5} />
              </tbody>
            </table>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => (
              <div key={index} className="rounded-xl p-5 transition-shadow flex flex-col md:flex-row gap-6 relative overflow-hidden group border" style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>

                {/* Status indicator line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full`} style={{
                  background: booking.status === 'cancelled' ? '#ef4444' :
                    booking.status === 'pending' ? '#f59e0b' : '#3AAFA9'
                }}></div>

                <div className="flex-1 pl-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold m-0 transition-colors" style={{ color: 'var(--text-main)' }}>{booking.eventTitle}</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{
                      background: booking.status === 'cancelled' ? 'rgba(239,68,68,0.12)' :
                        booking.status === 'pending' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                      color: booking.status === 'cancelled' ? '#fca5a5' :
                        booking.status === 'pending' ? '#fcd34d' : '#86efac'
                    }}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <div className="space-y-2">
                      <p className="flex justify-between"><strong style={{ color: 'var(--text-main)' }}>Date:</strong> <span>{formatDate(booking.eventDate)}</span></p>
                      <p className="flex justify-between"><strong style={{ color: 'var(--text-main)' }}>Location:</strong> <span>{booking.location}</span></p>
                      <p className="flex justify-between"><strong style={{ color: 'var(--text-main)' }}>Ref:</strong> <span className="font-mono px-1.5 rounded" style={{ background: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>{booking.bookingReference}</span></p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex justify-between"><strong style={{ color: 'var(--text-main)' }}>Tickets:</strong> <span>{booking.numTickets}</span></p>
                      <p className="flex justify-between"><strong style={{ color: 'var(--text-main)' }}>Total Price:</strong> <span className="font-semibold" style={{ color: '#3AAFA9' }}>{booking.totalPrice} {booking.currency}</span></p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    {/* Show Get Directions button for upcoming events */}
                    {new Date(booking.eventDate) > new Date() && booking.status !== 'cancelled' && (
                      <GetDirectionsButton
                        event={{
                          eventId: booking.eventId,
                          title: booking.eventTitle,
                          location: booking.location,
                          venueAddress: booking.venueAddress,
                          city: booking.city,
                          postcode: booking.postcode
                        }}
                        className="btn-secondary-action text-xs py-1.5 px-3"
                        style={{}}
                      />
                    )}

                    {/* Show review badge if the booking has been reviewed */}
                    {booking.reviewed && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', color: '#fcd34d' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                        {booking.review?.rating || '5'} - Reviewed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 md:w-36 md:border-l border-t md:border-t-0 pt-4 md:pt-0 md:pl-6 justify-center" style={{ borderColor: 'var(--border)' }}>
                  {/* Upcoming event actions */}
                  {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="btn-secondary-action flex-1 md:flex-none py-2 text-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking)}
                        className="btn-danger-action flex-1 md:flex-none py-2 text-sm"
                        style={{ fontSize: '13px' }}
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
                        className="btn-secondary-action flex-1 md:flex-none py-2 text-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOpenReviewModal(booking)}
                        className="btn-primary-action flex-1 md:flex-none py-2 text-sm"
                        style={{ margin: 0 }}
                      >
                        Review
                      </button>
                    </>
                  )}

                  {/* Past reviewed event actions */}
                  {activeTab === 'past' && booking.reviewed && (
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="btn-secondary-action w-full py-2 text-sm"
                    >
                      Details
                    </button>
                  )}

                  {/* Cancelled event actions */}
                  {(activeTab === 'cancelled' || (activeTab === 'all' && booking.status === 'cancelled')) && (
                    <button
                      onClick={() => handleViewDetails(booking)}
                      className="btn-secondary-action w-full py-2 text-sm"
                    >
                      Details
                    </button>
                  )}

                  {/* All tab - show different actions based on status */}
                  {activeTab === 'all' && booking.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => handleViewDetails(booking)}
                        className="btn-secondary-action flex-1 md:flex-none py-2 text-sm"
                      >
                        Details
                      </button>

                      {/* For past events that haven't been reviewed */}
                      {new Date(booking.eventDate) < new Date() && !booking.reviewed && (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="btn-primary-action flex-1 md:flex-none py-2 text-sm"
                          style={{ margin: 0 }}
                        >
                          Review
                        </button>
                      )}

                      {/* For upcoming events */}
                      {new Date(booking.eventDate) >= new Date() && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="btn-danger-action flex-1 md:flex-none py-2 text-sm"
                          style={{ fontSize: '13px' }}
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
          <div className="text-center py-12 px-4 rounded-xl border border-dashed" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-strong)' }}>
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(138,143,152,0.1)', color: 'var(--text-faint)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-lg font-medium mb-4" style={{ color: 'var(--text-muted)' }}>You don't have any {activeTab} bookings.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {activeTab !== 'all' && (
                <button onClick={() => setActiveTab('all')} className="btn-secondary-action">
                  View All Bookings
                </button>
              )}
              {userBookings.length === 0 && (
                <Link to="/events" className="btn-primary-action" style={{ margin: 0 }}>
                  Browse Events
                </Link>
              )}
            </div>
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
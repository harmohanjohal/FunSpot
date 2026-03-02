// userBookingService.js - Service for managing user bookings
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cancelBooking as apiCancelBooking } from './eventService';

export const addBookingToUser = async (userId, bookingData) => {
  if (!userId || !bookingData || !bookingData.eventId) {
    throw new Error('Invalid booking data or user ID');
  }

  try {
    const userRef = doc(db, 'users', userId);

    // Create booking object with consistent properties
    const booking = {
      ...bookingData,
      bookingDate: new Date().toISOString(),
      status: 'confirmed'
    };

    // Add to user's bookings array
    await updateDoc(userRef, {
      bookings: arrayUnion(booking)
    });

    return booking;
  } catch (error) {
    console.error('Error storing booking:', error);
    throw error;
  }
};

export const removeBookingFromUser = async (userId, bookingId) => {
  if (!userId || !bookingId) {
    throw new Error('Invalid booking ID or user ID');
  }

  try {
    const userRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const bookings = userData.bookings || [];

    const bookingToRemove = bookings.find(booking =>
      booking.bookingReference === bookingId
    );

    if (!bookingToRemove) {
      throw new Error('Booking not found');
    }

    await updateDoc(userRef, {
      bookings: arrayRemove(bookingToRemove)
    });

    return true;
  } catch (error) {
    console.error('Error removing booking:', error);
    throw error;
  }
};

export const getUserBookings = async (userId) => {
  if (!userId) {
    throw new Error('Invalid user ID');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    return userData.bookings || [];
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (userId, bookingId, newStatus) => {
  if (!userId || !bookingId || !newStatus) {
    throw new Error('Invalid parameters');
  }

  try {
    const userRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const bookings = userData.bookings || [];

    // Map through bookings to update status
    const updatedBookings = bookings.map(booking => {
      if (booking.bookingReference === bookingId) {
        return {
          ...booking,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return booking;
    });

    // Update the document with modified bookings
    await updateDoc(userRef, {
      bookings: updatedBookings
    });

    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const cancelBooking = async (userId, bookingReference) => {
  if (!userId || !bookingReference) {
    throw new Error('Invalid parameters');
  }

  try {
    const userRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const bookings = userData.bookings || [];

    // Find the booking to cancel
    const bookingToCancel = bookings.find(booking => booking.bookingReference === bookingReference);

    if (!bookingToCancel) {
      throw new Error('Booking not found');
    }

    if (bookingToCancel.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    // Call the backend API to update the event's available tickets
    const apiResponse = await apiCancelBooking(bookingToCancel.eventId, bookingToCancel.numTickets);

    if (!apiResponse.success) {
      throw new Error(apiResponse.error || 'Failed to cancel booking with the server');
    }

    // Update the booking status in Firebase
    await updateBookingStatus(userId, bookingReference, 'cancelled');

    return {
      success: true,
      message: `Successfully cancelled ${bookingToCancel.numTickets} tickets for ${bookingToCancel.eventTitle}`,
      remainingTickets: apiResponse.remainingTickets
    };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

export const submitReview = async (userId, reviewData) => {
  if (!userId || !reviewData || !reviewData.bookingReference) {
    throw new Error('Invalid parameters for review submission');
  }

  try {
    const userRef = doc(db, 'users', userId);

    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const bookings = userData.bookings || [];

    // Update the booking with review information
    const updatedBookings = bookings.map(booking => {
      if (booking.bookingReference === reviewData.bookingReference) {
        return {
          ...booking,
          review: {
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewDate: reviewData.reviewDate
          },
          reviewed: true
        };
      }
      return booking;
    });

    // Update user document with the reviewed booking
    await updateDoc(userRef, {
      bookings: updatedBookings
    });

    // Also store review in a separate collection for analytics
    try {
      const reviewsRef = collection(db, 'eventReviews');
      await addDoc(reviewsRef, {
        userId: userId,
        eventId: reviewData.eventId,
        eventTitle: reviewData.eventTitle,
        bookingReference: reviewData.bookingReference,
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewDate: reviewData.reviewDate
      });
    } catch (reviewError) {
      console.error('Error storing review in reviews collection:', reviewError);
      // Continue execution even if this fails - user still needs to see success
    }

    return true;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export default {
  addBookingToUser,
  removeBookingFromUser,
  getUserBookings,
  updateBookingStatus,
  cancelBooking,
  submitReview
};
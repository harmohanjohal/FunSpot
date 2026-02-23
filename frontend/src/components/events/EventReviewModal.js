import React, { useState } from 'react';
import Modal from '../common/Modal';
import FormField from '../common/FormField';

function EventReviewModal({ booking, isOpen, onClose, onSubmitReview }) {
  const [review, setReview] = useState({
    rating: 5,
    comment: '',
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (field, value) => {
    setReview({
      ...review,
      [field]: value
    });
  };
  
  const handleSubmit = async () => {
    if (!review.comment.trim()) {
      alert('Please enter a comment for your review.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call the onSubmitReview callback with the review data
      await onSubmitReview({
        eventId: booking.eventId,
        eventTitle: booking.eventTitle,
        bookingReference: booking.bookingReference,
        rating: review.rating,
        comment: review.comment,
        reviewDate: new Date().toISOString()
      });
      
      // Close the modal after successful submission
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Rating options
  const ratingOptions = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' }
  ];
  
  return (
    <Modal
      isOpen={isOpen}
      title={`Review for ${booking?.eventTitle || 'Event'}`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button 
            onClick={handleSubmit} 
            className="btn" 
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </>
      }
    >
      <div className="review-form">
        <p style={{ marginBottom: '20px' }}>
          Share your experience at this event. Your review helps other users make informed decisions.
        </p>
        
        <FormField
          id="rating"
          label="Rating"
          type="select"
          value={review.rating}
          onChange={(e) => handleChange('rating', parseInt(e.target.value))}
          options={ratingOptions}
        />
        
        <FormField
          id="comment"
          label="Your Review"
          type="textarea"
          value={review.comment}
          onChange={(e) => handleChange('comment', e.target.value)}
          placeholder="Tell us about your experience at this event..."
          required
        />
      </div>
    </Modal>
  );
}

export default EventReviewModal;
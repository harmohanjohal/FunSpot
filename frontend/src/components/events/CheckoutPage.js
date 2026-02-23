import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookEvent, convertEventPrice } from '../../api/eventService';
import { addBookingToUser } from '../../api/userBookingService';
import { useAuth } from '../../context/AuthContext';
import FormField from '../common/FormField';
import LoadingSpinner from '../common/LoadingSpinner';

function CheckoutPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { event, numTickets } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  // Currency conversion states
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [totalPriceAmount, setTotalPriceAmount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  // Currency options
  const currencies = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "GBP": "British Pound",
    "AUD": "Australian Dollar",
    "CAD": "Canadian Dollar",
    "INR": "Indian Rupee",
    "JPY": "Japanese Yen"
  };
  
  // Set initial currency and price
  useEffect(() => {
    if (event) {
      const eventCurrency = event.currency || 'USD';
      setSelectedCurrency(eventCurrency);
      setTotalPriceAmount((numTickets * event.ticketPrice).toFixed(2));
    }
  }, [event, numTickets]);
  
  // Check if there is valid state data
  useEffect(() => {
    // If navigated directly to this page without state, redirect to events
    if (!event || !numTickets) {
      navigate('/events');
    }
  }, [event, numTickets, navigate]);
  
  // Handle input change
  const handleInputChange = (field, value) => {
    setPaymentInfo({
      ...paymentInfo,
      [field]: value
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };
  
  // Handle currency change
  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    
    // If same as current currency, do nothing
    if (newCurrency === selectedCurrency) {
      return;
    }
    
    setIsConverting(true);
    setError(null);
    
    try {
      // Call the API to convert the currency
      const response = await convertEventPrice(event.eventId, newCurrency);
      
      if (response && response.success) {
        // The API returns the converted price for a single ticket
        // Multiply by the number of tickets to get total price
        const convertedUnitPrice = response.convertedAmount || response.amount;
        const convertedTotalPrice = (convertedUnitPrice * numTickets).toFixed(2);
        
        setSelectedCurrency(newCurrency);
        setTotalPriceAmount(convertedTotalPrice);
      } else {
        // Handle API error
        throw new Error(response?.error || 'Failed to convert currency');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      setError('Failed to convert currency. Please try again.');
      
      // Revert to original currency
      setSelectedCurrency(event.currency || 'USD');
      setTotalPriceAmount((numTickets * event.ticketPrice).toFixed(2));
    } finally {
      setIsConverting(false);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Simple validation rules
    if (!paymentInfo.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentInfo.cardName) {
      newErrors.cardName = 'Name on card is required';
    }
    
    if (!paymentInfo.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Please use MM/YY format';
    }
    
    if (!paymentInfo.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Check if there is event data
    if (!event || !numTickets) {
      setError('Missing event information. Please go back and try again.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to book tickets
      const response = await bookEvent(event.eventId, numTickets);
      
      // Check if the API call was successful
      if (response && response.success) {
        // Generate a booking reference if none is provided by the API
        const bookingReference = response.bookingReference || `BOOK-${Date.now().toString(36).toUpperCase()}`;
        
        // Store booking in user's Firebase record
        await addBookingToUser(currentUser.uid, {
          eventId: event.eventId,
          eventTitle: event.title,
          eventDate: event.date,
          numTickets: numTickets,
          totalPrice: totalPriceAmount,
          currency: selectedCurrency,
          bookingReference: bookingReference,
          location: event.location,
          status: 'confirmed',
          username: currentUser.email
        });
        
        // Navigate to success page with booking details
        navigate('/booking-success', { 
          state: { 
            eventTitle: event.title,
            eventDate: event.date,
            bookingReference: bookingReference,
            numTickets: numTickets,
            totalPrice: totalPriceAmount,
            currency: selectedCurrency,
            username: currentUser.email || currentUser.displayName
          } 
        });
      } else {
        // Handle booking failure
        throw new Error(response?.error || 'Failed to book tickets. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };
  
  // If no event data, show loading until the useEffect redirects
  if (!event || !numTickets) {
    return <LoadingSpinner message="Loading checkout..." />;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Checkout</h2>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {loading ? (
        <LoadingSpinner message="Processing payment..." />
      ) : (
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Order Summary */}
          <div className="dashboard-card">
            <h3 className="dashboard-title">Order Summary</h3>
            <div className="order-summary">
              <h4>{event.title}</h4>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-GB', { 
                day: 'numeric', month: 'short', year: 'numeric' 
              })}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Number of Tickets:</strong> {numTickets}</p>
              
              <div className="price-summary" style={{ 
                marginTop: '20px', 
                padding: '15px', 
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price per ticket:</span>
                  <span>{event.ticketPrice} {event.currency || 'USD'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <span><strong>Total Price:</strong></span>
                  <span><strong>{totalPriceAmount} {selectedCurrency}</strong></span>
                </div>
                
                {/* Currency Conversion Dropdown */}
                <div style={{ marginTop: '15px' }}>
                  <label htmlFor="currencySelect" style={{ display: 'block', marginBottom: '5px' }}>
                    Change Currency:
                  </label>
                  <select
                    id="currencySelect"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    disabled={isConverting}
                    className="form-control"
                  >
                    {Object.keys(currencies).map(currency => (
                      <option key={currency} value={currency}>
                        {currency} - {currencies[currency]}
                      </option>
                    ))}
                  </select>
                  
                  {isConverting && (
                    <div style={{ marginTop: '5px', fontSize: '14px', color: '#1da1f2' }}>
                      Converting...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="dashboard-card">
            <h3 className="dashboard-title">Payment Details</h3>
            <form onSubmit={handleSubmit}>
              <FormField
                id="cardNumber"
                label="Card Number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={paymentInfo.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                error={errors.cardNumber}
              />
              
              <FormField
                id="cardName"
                label="Name on Card"
                type="text"
                placeholder="John Doe"
                value={paymentInfo.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
                error={errors.cardName}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <FormField
                  id="expiryDate"
                  label="Expiry Date"
                  type="text"
                  placeholder="MM/YY"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  error={errors.expiryDate}
                />
                
                <FormField
                  id="cvv"
                  label="CVV"
                  type="text"
                  placeholder="123"
                  value={paymentInfo.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  error={errors.cvv}
                />
              </div>
              
              <p style={{ fontSize: '14px', color: '#657786', marginTop: '15px' }}>
                This is a demo application. No actual payment will be processed.
              </p>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading || isConverting}
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="btn"
                  disabled={loading || isConverting}
                >
                  {loading ? 'Processing...' : `Pay ${totalPriceAmount} ${selectedCurrency}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
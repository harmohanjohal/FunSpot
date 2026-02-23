import React from 'react';
import Modal from './Modal';

function RefundPolicy({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title="Refund Policy"
      onClose={onClose}
      footer={
        <button onClick={onClose} className="btn">Close</button>
      }
    >
      <div className="refund-policy-content">
        <h3>Refund Processing Information</h3>
        
        <p>When you cancel a booking, your refund will be processed according to the following guidelines:</p>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Refund Timeline</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li>Refunds are typically processed within 1-2 business days.</li>
            <li>The funds will be sent back to your original payment method.</li>
            <li>It may take 3-5 business days for the funds to appear in your account, depending on your bank or card issuer.</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Refund Amounts</h4>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            <li><strong>Full refund:</strong> Cancellations made more than 7 days before the event date.</li>
            <li><strong>Partial refund (80%):</strong> Cancellations made between 3-7 days before the event date.</li>
            <li><strong>Partial refund (50%):</strong> Cancellations made less than 3 days before the event date.</li>
            <li><strong>No refund:</strong> Cancellations made on the day of the event.</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Processing Issues</h4>
          <p>
            If you haven't received your refund within 5 business days, please contact our customer 
            support team with your booking reference number.
          </p>
        </div>
        
        <div style={{ marginTop: '15px', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
          <p style={{ fontSize: '14px', color: '#657786' }}>
            <strong>Note:</strong> Some credit card companies and banks may take longer to process 
            the refund. The timing of when you see the credit depends on the payment method and 
            your financial institution.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default RefundPolicy;
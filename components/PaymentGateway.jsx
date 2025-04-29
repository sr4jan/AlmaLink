'use client';
import { useEffect } from 'react';
import styles from '@/styles/PaymentGateway.module.css';

export default function PaymentGateway({ amount, onSuccess, onClose }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Razorpay takes amount in paise
      currency: 'INR',
      name: 'AlmaLink Donation',
      description: 'Donation to College Infrastructure',
      handler: function(response) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature
        });
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      theme: {
        color: '#0072ff'
      },
      modal: {
        ondismiss: onClose
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Complete Payment</h2>
        <div className={styles.content}>
          <p className={styles.amount}>Amount: ₹{amount}</p>
          <div className={styles.buttons}>
            <button onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handlePayment} className={styles.payButton}>
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
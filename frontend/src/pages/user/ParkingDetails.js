import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ParkingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const parking = location.state?.parking;
  
  const [bookingForm, setBookingForm] = useState({ 
    date: location.state?.date || '', 
    timeSlot: location.state?.timeSlot || '' 
  });
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // If no parking data passed, redirect back to search
  useEffect(() => {
    if (!parking) {
      navigate('/search');
    } else {
      // Fetch reviews for this parking
      fetchReviews();
    }
  }, [parking, navigate]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${parking._id}`);
      setReviews(res.data || []);
    } catch (err) {
      setReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      setMessage('⚠️ Please add a comment');
      return;
    }
    setSubmittingReview(true);
    setMessage('');
    try {
      await API.post('/reviews', {
        parkingId: parking._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setMessage('✅ Review submitted successfully');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!parking) return null;

  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'
  ];

  const handleBook = async () => {
    if (!bookingForm.date || !bookingForm.timeSlot) {
      return setMessage('⚠️ Please select date and time first!');
    }

    setLoading(true);
    setMessage('');

    try {
      const profileRes = await API.get('/auth/profile');
      if (!profileRes.data?.isProfileComplete) {
        setMessage('⚠️ Complete your profile before booking');
        setTimeout(() => navigate('/profile'), 1500);
        return;
      }
    } catch (err) {
      setMessage('⚠️ Unable to verify profile. Please try again.');
      setLoading(false);
      return;
    }

    try {
      await API.post('/booking/create', {
        parkingId: parking._id,
        date: bookingForm.date,
        timeSlot: bookingForm.timeSlot
      });
      localStorage.setItem('parkhubBookingRefresh', String(Date.now()));
      setMessage('✅ Booking request sent! Waiting for owner approval.');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/search');
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{parking.name}</h1>
          <button style={styles.backBtn} onClick={handleCancel}>← Back to Search</button>
        </div>

        <div style={styles.detailsCard}>
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>📍 Location Details</h2>
            <p style={styles.detailText}><strong>Address:</strong> {parking.location?.address || 'N/A'}</p>
            {parking.location?.lat && parking.location?.lng && (
              <p style={styles.detailText}>
                <strong>Coordinates:</strong> {parking.location.lat.toFixed(4)}, {parking.location.lng.toFixed(4)}
              </p>
            )}
          </div>

          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>💰 Pricing & Availability</h2>
            <p style={styles.detailText}><strong>Price:</strong> ₹{parking.price}/hour {parking.pricePerDay && `/ ₹${parking.pricePerDay}/day`}</p>
            <p style={styles.detailText}><strong>Available Slots:</strong> {parking.availableSlots} / {parking.totalSlots}</p>
            {typeof parking.distance === 'number' && (
              <p style={styles.detailText}><strong>Distance:</strong> {parking.distance.toFixed(2)} km away</p>
            )}
            {parking.averageRating && (
              <p style={styles.detailText}><strong>Rating:</strong> {'⭐'.repeat(Math.round(parking.averageRating))} {parking.averageRating.toFixed(1)}/5 ({parking.reviewCount} reviews)</p>
            )}
          </div>

          {parking.features && Object.values(parking.features).some(v => v) && (
            <div style={styles.detailSection}>
              <h2 style={styles.sectionTitle}>✨ Features</h2>
              <div style={styles.featureTags}>
                {parking.features.cctvAvailable && <span style={styles.featureTag}>🎥 CCTV</span>}
                {parking.features.coveredParking && <span style={styles.featureTag}>🏠 Covered</span>}
                {parking.features.evCharging && <span style={styles.featureTag}>🔌 EV Charging</span>}
                {parking.features.security && <span style={styles.featureTag}>🛡️ Security</span>}
              </div>
            </div>
          )}

          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>⭐ Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p style={styles.detailText}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={styles.reviewsList}>
                {reviews.map((rev) => (
                  <div key={rev._id} style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <p style={styles.reviewerName}>{rev.user?.name || 'User'}</p>
                      <span style={styles.reviewRating}>{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    <p style={styles.reviewComment}>{rev.comment}</p>
                    <p style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div style={styles.reviewFormSection}>
              <h3 style={styles.reviewFormTitle}>Share Your Experience</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rating:</label>
                <div style={styles.ratingSelect}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      style={{ ...styles.starBtn, background: star <= reviewForm.rating ? '#fbbf24' : '#e5e7eb' }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Review:</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Share your experience with this parking..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button
                style={{ ...styles.submitReviewBtn, opacity: submittingReview ? 0.7 : 1 }}
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>

          <div style={styles.bookingSection}>
            <h2 style={styles.sectionTitle}>📅 Select Booking Time</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Date:</label>
              <input
                type="date"
                style={styles.input}
                value={bookingForm.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Time Slot:</label>
              <select
                style={styles.select}
                value={bookingForm.timeSlot}
                onChange={(e) => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {message && (
            <p style={{
              ...styles.message,
              color: message.includes('✅') ? '#15803d' : '#b91c1c'
            }}>
              {message}
            </p>
          )}

          <div style={styles.buttonGroup}>
            <button 
              style={{
                ...styles.bookBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? 'Sending Request...' : 'Book Now'}
            </button>
            <button style={styles.cancelBtn} onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '24px 16px',
    background: '#f5f7fa'
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.5px'
  },
  backBtn: {
    background: '#ffffff',
    color: '#7c3aed',
    border: '1.5px solid #7c3aed',
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  detailsCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
    transition: 'all 0.25s ease'
  },
  detailSection: {
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827'
  },
  detailText: {
    margin: '8px 0',
    fontSize: '15px',
    color: '#4b5563'
  },
  bookingSection: {
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff'
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    backgroundColor: '#ffffff'
  },
  message: {
    margin: '16px 0',
    padding: '12px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap'
  },
  bookBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    minWidth: '140px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  cancelBtn: {
    flex: 1,
    background: '#ffffff',
    color: '#ef4444',
    border: '1.5px solid #ef4444',
    padding: '14px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '16px',
    minWidth: '140px',
    transition: 'all 0.2s'
  },
  featureTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  featureTag: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#5b21b6',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600'
  },
  reviewsList: {
    display: 'grid',
    gap: '12px',
    marginBottom: '20px'
  },
  reviewCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '12px 14px'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  reviewerName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827'
  },
  reviewRating: {
    fontSize: '12px'
  },
  reviewComment: {
    margin: '6px 0',
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.4'
  },
  reviewDate: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af'
  },
  reviewFormSection: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '14px',
    marginTop: '16px'
  },
  reviewFormTitle: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827'
  },
  ratingSelect: {
    display: 'flex',
    gap: '6px'
  },
  starBtn: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '700',
    transition: 'all 0.2s'
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    padding: '12px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    transition: 'all 0.2s'
  },
  submitReviewBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  }
};

export default ParkingDetails;

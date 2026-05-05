import { useState, useEffect } from 'react';
import API from '../../api/axios';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [reasonDialog, setReasonDialog] = useState({
    open: false,
    mode: 'reject',
    booking: null,
    reason: ''
  });

  useEffect(() => {
    fetchBookings();

    const refreshTimer = setInterval(() => {
      fetchBookings();
    }, 10000);

    const handleRefreshSignal = () => {
      fetchBookings();
    };

    window.addEventListener('storage', handleRefreshSignal);
    window.addEventListener('focus', handleRefreshSignal);

    return () => {
      clearInterval(refreshTimer);
      window.removeEventListener('storage', handleRefreshSignal);
      window.removeEventListener('focus', handleRefreshSignal);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/booking/owner');
      setBookings(Array.isArray(res.data) ? res.data : []);
      setMessage('');
    } catch (err) {
      setMessage('Failed to load bookings');
    }
    setLoading(false);
  };

  const handleAction = async (id, status, rejectionReason = '') => {
    try {
      await API.put(`/booking/status/${id}`, {
        status,
        rejectionReason
      });
      setMessage(status ? `✅ Booking ${status}!` : '✅ Rejection reason updated!');
      setTimeout(() => setMessage(''), 3000);
      fetchBookings(); // refresh list
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Action failed');
    }
  };

  const openRejectDialog = (booking) => {
    setReasonDialog({
      open: true,
      mode: 'reject',
      booking,
      reason: ''
    });
  };

  const openReasonDialog = (booking) => {
    setReasonDialog({
      open: true,
      mode: 'view',
      booking,
      reason: booking.rejectionReason || ''
    });
  };

  const closeReasonDialog = () => {
    setReasonDialog({
      open: false,
      mode: 'reject',
      booking: null,
      reason: ''
    });
  };

  const saveReason = async () => {
    if (!reasonDialog.booking) {
      return;
    }

    const trimmedReason = reasonDialog.reason.trim();

    if (!trimmedReason) {
      setMessage('❌ Please enter a rejection reason');
      return;
    }

    if (reasonDialog.mode === 'reject') {
      await handleAction(reasonDialog.booking._id, 'rejected', trimmedReason);
    } else {
      await handleAction(reasonDialog.booking._id, '', trimmedReason);
    }

    closeReasonDialog();
  };

  const filteredBookings = bookings.filter(b =>
    (b.parking?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (b.user?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (b.user?.email || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={styles.kicker}>BOOKING MANAGEMENT</p>
        <h1 style={styles.title}>Booking Requests</h1>
        <p style={styles.subtitle}>Manage incoming parking booking requests</p>

        {message && (
          <div style={{
            ...styles.message,
            background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('✅') ? '#166534' : '#991b1b',
            borderColor: message.includes('✅') ? '#bbf7d0' : '#fecaca'
          }}>
            {message}
          </div>
        )}

        {/* Search Bar */}
        <div style={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search by parking name, user, or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={styles.searchBar}
          />
        </div>

        {loading ? (
          <div style={styles.loadingState}>Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No booking requests yet</p>
            <p style={styles.emptySubtext}>Booking requests from users will appear here</p>
          </div>
        ) : (
          <div style={styles.bookingsGrid}>
            {filteredBookings.map((b) => (
              <div key={b._id} style={styles.bookingCard}>
                {(() => {
                  const bookingStatus = b.status || 'pending';
                  const bookingStatusLabel = bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1);

                  return (
                    <>
                <div style={styles.cardTop}>
                  <div style={styles.parkingInfo}>
                    <h3 style={styles.parkingName}>{b.parking?.name || 'Parking'}</h3>
                    <p style={styles.parkingLocation}>
                      {typeof b.parking?.location === 'string'
                        ? b.parking.location
                        : b.parking?.location?.address || 'Location'}
                    </p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: bookingStatus === 'approved' ? '#d1fae5' : bookingStatus === 'rejected' ? '#fee2e2' : '#fef3c7',
                    color: bookingStatus === 'approved' ? '#065f46' : bookingStatus === 'rejected' ? '#991b1b' : '#d97706',
                    border: `1px solid ${bookingStatus === 'approved' ? '#10b981' : bookingStatus === 'rejected' ? '#ef4444' : '#f59e0b'}`
                  }}>
                    {bookingStatusLabel}
                  </span>
                </div>

                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>User</span>
                    <span style={styles.detailValue}>{b.user?.name || 'User'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Email</span>
                    <span style={styles.detailValue}>{b.user?.email || 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Date & Time</span>
                    <span style={styles.detailValue}>{b.date} at {b.timeSlot}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Price</span>
                    <span style={styles.detailValue}>₹{b.parking?.price || '0'}/hour</span>
                  </div>
                  {bookingStatus === 'rejected' && b.rejectionReason && (
                    <div style={styles.reasonPreview}>
                      <span style={styles.detailLabel}>Reason</span>
                      <span style={styles.detailValue}>{b.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {bookingStatus === 'pending' && (
                  <div style={styles.actionButtons}>
                    <button
                      style={styles.approveBtn}
                      onClick={() => handleAction(b._id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      style={styles.rejectBtn}
                      onClick={() => openRejectDialog(b)}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {bookingStatus === 'rejected' && (
                  <div style={styles.actionButtonsSingle}>
                    <button
                      style={styles.reasonBtn}
                      onClick={() => openReasonDialog(b)}
                    >
                      Reason
                    </button>
                  </div>
                )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </div>

      {reasonDialog.open && reasonDialog.booking && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <p style={styles.modalKicker}>
              {reasonDialog.mode === 'reject' ? 'REJECT BOOKING' : 'REJECTION REASON'}
            </p>
            <h3 style={styles.modalTitle}>
              {reasonDialog.mode === 'reject'
                ? `Reject ${reasonDialog.booking.parking?.name || 'booking'}`
                : `Reason for ${reasonDialog.booking.parking?.name || 'booking'}`}
            </h3>

            {reasonDialog.mode === 'view' ? (
              <div style={styles.reasonBox}>
                <p style={styles.reasonText}>{reasonDialog.reason || 'No reason provided yet.'}</p>
              </div>
            ) : (
              <textarea
                value={reasonDialog.reason}
                onChange={(e) => setReasonDialog((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter the rejection reason"
                style={styles.reasonInput}
                rows={5}
              />
            )}

            <div style={styles.modalActions}>
              <button style={styles.modalSecondaryBtn} onClick={closeReasonDialog}>
                Close
              </button>

              {reasonDialog.mode === 'view' ? (
                <button
                  style={styles.modalPrimaryBtn}
                  onClick={() => setReasonDialog((prev) => ({ ...prev, mode: 'edit' }))}
                >
                  Edit
                </button>
              ) : (
                <button style={styles.modalPrimaryBtn} onClick={saveReason}>
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '20px 0',
    backgroundColor: '#f3f4f8'
  },
  container: {
    width: 'min(1200px, 92vw)',
    margin: '0 auto'
  },
  kicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1.2px',
    color: '#7c3aed',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  title: {
    margin: '6px 0 4px',
    fontSize: '26px',
    letterSpacing: '-0.5px',
    color: '#111827',
    lineHeight: 1.2,
    fontWeight: '800'
  },
  subtitle: {
    margin: '0 0 18px',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500'
  },
  message: {
    padding: '12px 16px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '16px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center'
  },
  searchBarContainer: {
    marginBottom: '18px'
  },
  searchBar: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box'
  },
  loadingState: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#6b7280',
    fontSize: '15px'
  },
  emptyState: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '42px 24px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  emptyText: {
    margin: '0 0 6px',
    color: '#374151',
    fontSize: '16px',
    fontWeight: '600'
  },
  emptySubtext: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '400'
  },
  bookingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    marginTop: '0'
  },
  bookingCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease',
    overflow: 'hidden'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '14px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f8'
  },
  parkingInfo: {
    flex: 1,
    minWidth: 0
  },
  parkingName: {
    margin: '0 0 4px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  parkingLocation: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '6px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    minWidth: '72px',
    textAlign: 'center'
  },
  cardDetails: {
    marginBottom: '14px'
  },
  reasonPreview: {
    display: 'grid',
    gridTemplateColumns: '88px 1fr',
    gap: '10px',
    alignItems: 'start',
    padding: '10px 0 0'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '10px',
    fontSize: '13px'
  },
  detailLabel: {
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '11px',
    letterSpacing: '0.3px'
  },
  detailValue: {
    color: '#374151',
    fontWeight: '500',
    textAlign: 'right'
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f8'
  },
  actionButtonsSingle: {
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f8'
  },
  approveBtn: {
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '8px',
    background: '#d1fae5',
    color: '#065f46',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  reasonBtn: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #c7d2fe',
    borderRadius: '8px',
    background: '#eef2ff',
    color: '#4338ca',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  rejectBtn: {
    padding: '10px 14px',
    fontSize: '13px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '8px',
    background: '#fee2e2',
    color: '#991b1b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 50
  },
  modalCard: {
    width: 'min(520px, 100%)',
    background: '#fff',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
    border: '1px solid #e5e7eb'
  },
  modalKicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1.2px',
    color: '#7c3aed',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  modalTitle: {
    margin: '6px 0 16px',
    fontSize: '24px',
    lineHeight: 1.2,
    color: '#111827',
    fontWeight: '800'
  },
  reasonInput: {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '12px',
    border: '1px solid #d1d5db',
    padding: '14px 16px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px'
  },
  reasonBox: {
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '14px 16px',
    marginBottom: '18px'
  },
  reasonText: {
    margin: 0,
    color: '#374151',
    fontSize: '14px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap'
  },
  modalActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '18px'
  },
  modalSecondaryBtn: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  },
  modalPrimaryBtn: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default BookingRequests;
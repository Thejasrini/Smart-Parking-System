import { useState, useEffect } from 'react';
import API from '../../api/axios';

const statusColor = { pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444' };

const formatDate = (booking) => {
  if (booking.createdAt) {
    const d = new Date(booking.createdAt);
    return d.toLocaleString();
  }
  return [booking.date, booking.timeSlot].filter(Boolean).join(', ');
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/booking/mine');
      setBookings(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const total = bookings.length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;
  const rejected = bookings.filter((b) => b.status === 'rejected').length;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={styles.kicker}>DRIVER CONTROL</p>
        <h1 style={styles.title}>My Bookings</h1>

        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>TOTAL</p>
            <p style={{ ...styles.metricValue, color: '#1248b8' }}>{total}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>PENDING</p>
            <p style={{ ...styles.metricValue, color: '#f4b000' }}>{pending}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>APPROVED</p>
            <p style={{ ...styles.metricValue, color: '#22c55e' }}>{approved}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>REJECTED</p>
            <p style={{ ...styles.metricValue, color: '#ff2a2a' }}>{rejected}</p>
          </div>
        </div>

        <section style={styles.historyWrap}>
          <div style={styles.historyHeader}>
            <div>
              <p style={styles.historyKicker}>HISTORY</p>
              <h2 style={styles.historyTitle}>Your booking requests</h2>
            </div>
            <button type="button" style={styles.refreshBtn} onClick={fetchBookings}>Refresh</button>
          </div>

          {loading && <p style={styles.emptyText}>Loading bookings...</p>}
          {!loading && bookings.length === 0 && <p style={styles.emptyText}>No bookings yet.</p>}

          {!loading && bookings.map((b) => (
            <div key={b._id} style={styles.bookingRow}>
              <div style={styles.rowTop}>
                <h3 style={styles.parkingName}>{b.parking?.name || 'Parking'}</h3>
                <span style={{ ...styles.statusChip, color: statusColor[b.status], borderColor: statusColor[b.status] }}>
                  {b.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <p style={styles.rowMeta}>
                {formatDate(b)} · {b.timeSlot || '-'} · ₹{b.parking?.price || 0}/hr
              </p>

              <p style={styles.rowSub}>
                Address: {b.parking?.location?.address || 'N/A'}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '32px 24px',
    backgroundColor: '#f5f7fa'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  kicker: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  title: {
    margin: '12px 0 24px',
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    letterSpacing: '-0.5px'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  metricCard: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.25s ease'
  },
  metricLabel: {
    margin: 0,
    fontSize: '11px',
    color: '#6b7280',
    letterSpacing: '0.5px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  metricValue: {
    margin: '8px 0 0',
    fontSize: '28px',
    lineHeight: 1,
    fontWeight: '800'
  },
  historyWrap: {
    marginTop: '24px',
    background: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb'
  },
  historyHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  historyKicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '0.5px',
    color: '#7c3aed',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  historyTitle: {
    margin: '4px 0 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827'
  },
  refreshBtn: {
    border: '1.5px solid #7c3aed',
    background: '#ffffff',
    color: '#7c3aed',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '10px',
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'all 0.25s ease'
  },
  emptyText: {
    margin: 0,
    padding: '48px 24px',
    color: '#6b7280',
    fontSize: '15px',
    textAlign: 'center'
  },
  bookingRow: {
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  },
  parkingName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827'
  },
  statusChip: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#f9fafb'
  },
  rowMeta: {
    margin: '8px 0 0',
    fontSize: '14px',
    color: '#6b7280'
  },
  rowSub: {
    margin: '6px 0 0',
    fontSize: '13px',
    color: '#9ca3af'
  }
};

export default MyBookings;
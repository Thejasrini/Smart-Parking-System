import { useState, useEffect } from 'react';
import API from '../../api/axios';

const ApproveParkings = () => {
  const [parkings, setParkings] = useState([]);
  const [message, setMessage]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchParkings(); }, []);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/parking/all');
      setParkings(res.data);
    } catch (err) {
      setMessage('❌ Failed to load parkings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.put(`/parking/approve/${id}`);
      setMessage('✅ Parking approved successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchParkings();
    } catch (err) {
      setMessage('❌ Failed to approve parking');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReject = async (id) => {
    try {
      await API.put(`/parking/reject/${id}`);
      setMessage('✅ Request rejected successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchParkings();
    } catch (err) {
      setMessage('❌ Failed to reject parking');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const pendingParkings = parkings.filter(p => !p.isApproved && !p.isRejected);
  const approvedParkings = parkings.filter(p => p.isApproved);
  const rejectedParkings = parkings.filter(p => p.isRejected);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={styles.kicker}>ADMIN PANEL</p>
        <h1 style={styles.title}>Approve Parkings</h1>

        {message && (
          <div style={{
            ...styles.message,
            background: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
            color: message.includes('✅') ? '#065f46' : '#991b1b',
            borderColor: message.includes('✅') ? '#10b981' : '#ef4444'
          }}>
            {message}
          </div>
        )}

        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>PENDING</p>
            <p style={{ ...styles.metricValue, color: '#f59e0b' }}>{pendingParkings.length}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>APPROVED</p>
            <p style={{ ...styles.metricValue, color: '#10b981' }}>{approvedParkings.length}</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricLabel}>TOTAL</p>
            <p style={{ ...styles.metricValue, color: '#3b82f6' }}>{parkings.length}</p>
          </div>
        </div>

        {loading && <p style={styles.loadingText}>Loading parkings...</p>}

        {!loading && pendingParkings.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>AWAITING APPROVAL</p>
                <h2 style={styles.sectionTitle}>Pending parkings</h2>
              </div>
              <span style={styles.sectionCount}>{pendingParkings.length} items</span>
            </div>

            <div style={styles.pendingCardGrid}>
              {pendingParkings.map((p) => (
                <div key={p._id} className="admin-parking-card" style={styles.parkingCardApproved}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardName}>{p.name}</h3>
                    <span style={{ ...styles.statusBadge, background: '#fef3c7', color: '#d97706', borderColor: '#f59e0b' }}>
                      PENDING
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.cardInfo}>📍 {p.location?.address || 'No address'}</p>
                    <p style={styles.cardInfo}>👤 Owner: {p.owner?.name || 'N/A'} ({p.owner?.email || 'N/A'})</p>
                    <div style={styles.cardStats}>
                      <span style={styles.statItem}>🔢 {p.totalSlots} slots</span>
                      <span style={styles.statItem}>💰 ₹{p.price}/hr</span>
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button style={styles.rejectBtn} onClick={() => handleReject(p._id)}>
                      ❌ Reject Parking
                    </button>
                    <button style={styles.approveBtn} onClick={() => handleApprove(p._id)}>
                      ✅ Approve Parking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && approvedParkings.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>ALREADY APPROVED</p>
                <h2 style={styles.sectionTitle}>Approved parkings</h2>
              </div>
              <span style={styles.sectionCount}>{approvedParkings.length} items</span>
            </div>

            <div style={styles.cardGrid}>
              {approvedParkings.map((p) => (
                <div key={p._id} style={styles.parkingCardApproved}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardName}>{p.name}</h3>
                    <span style={{ ...styles.statusBadge, background: '#d1fae5', color: '#065f46', borderColor: '#10b981' }}>
                      APPROVED
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.cardInfo}>📍 {p.location?.address || 'No address'}</p>
                    <p style={styles.cardInfo}>👤 Owner: {p.owner?.name || 'N/A'} ({p.owner?.email || 'N/A'})</p>
                    <div style={styles.cardStats}>
                      <span style={styles.statItem}>🔢 {p.totalSlots} slots</span>
                      <span style={styles.statItem}>💰 ₹{p.price}/hr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && rejectedParkings.length > 0 && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionKicker}>NOT APPROVED</p>
                <h2 style={styles.sectionTitle}>Rejected parkings</h2>
              </div>
              <span style={styles.sectionCount}>{rejectedParkings.length} items</span>
            </div>

            <div style={styles.cardGrid}>
              {rejectedParkings.map((p) => (
                <div key={p._id} style={styles.parkingCardRejected}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardName}>{p.name}</h3>
                    <span style={{ ...styles.statusBadge, background: '#fee2e2', color: '#991b1b', borderColor: '#ef4444' }}>
                      REJECT
                    </span>
                  </div>

                  <div style={styles.cardBody}>
                    <p style={styles.cardInfo}>📍 {p.location?.address || 'No address'}</p>
                    <p style={styles.cardInfo}>👤 Owner: {p.owner?.name || 'N/A'} ({p.owner?.email || 'N/A'})</p>
                    <div style={styles.cardStats}>
                      <span style={styles.statItem}>🔢 {p.totalSlots} slots</span>
                      <span style={styles.statItem}>💰 ₹{p.price}/hr</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && parkings.length === 0 && (
          <p style={styles.emptyText}>No parkings found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '22px 0',
    backgroundColor: '#f5f7fa'
  },
  container: {
    width: 'min(1320px, 94vw)',
    margin: '0 auto'
  },
  kicker: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '700'
  },
  title: {
    margin: '8px 0 22px',
    fontSize: '28px',
    letterSpacing: '-1px',
    color: '#111827',
    lineHeight: 1,
    fontWeight: '800'
  },
  message: {
    padding: '14px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '15px',
    marginBottom: '20px',
    border: '1px solid'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(200px, 1fr))',
    border: '1px solid #e5e7eb',
    background: '#fff',
    marginBottom: '24px',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)'
  },
  metricCard: {
    borderRight: '1px solid #e5e7eb',
    padding: '20px 24px',
    minHeight: '110px'
  },
  metricLabel: {
    margin: 0,
    fontSize: '11px',
    color: '#6b7280',
    letterSpacing: '1.4px',
    fontWeight: '700'
  },
  metricValue: {
    margin: '10px 0 0',
    fontSize: '28px',
    lineHeight: 1,
    fontWeight: '800'
  },
  loadingText: {
    margin: 0,
    padding: '16px 20px',
    color: '#6b7280',
    fontSize: '18px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px'
  },
  section: {
    marginTop: '24px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    padding: '18px 24px'
  },
  sectionKicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1px',
    opacity: 0.9
  },
  sectionTitle: {
    margin: '4px 0 0',
    fontSize: '24px',
    lineHeight: 1,
    letterSpacing: '-0.6px',
    fontWeight: '800'
  },
  sectionCount: {
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.14)',
    padding: '8px 14px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    padding: '18px'
  },
  pendingCardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 280px))',
    gap: '16px',
    padding: '18px',
    justifyContent: 'start'
  },
  parkingCard: {
    padding: '18px',
    border: '1px solid #d1fae5',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)'
  },
  parkingCardApproved: {
    padding: '18px',
    border: '1px solid #d1fae5',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)'
  },
  parkingCardRejected: {
    padding: '18px',
    border: '1px solid #fecaca',
    borderRadius: '14px',
    background: 'linear-gradient(180deg, #ffffff 0%, #fef2f2 100%)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },
  cardName: {
    margin: 0,
    fontSize: '26px',
    color: '#111827',
    fontWeight: '700'
  },
  statusBadge: {
    border: '1px solid',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '700'
  },
  cardBody: {
    marginBottom: '16px'
  },
  cardInfo: {
    margin: '8px 0',
    fontSize: '15px',
    color: '#4b5563'
  },
  cardStats: {
    display: 'flex',
    gap: '20px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  statItem: {
    fontSize: '15px',
    color: '#374151',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  approveBtn: {
    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    width: '100%',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
  },
  rejectBtn: {
    background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    width: '100%',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  emptyText: {
    margin: 0,
    padding: '16px 20px',
    color: '#6b7280',
    fontSize: '18px',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px'
  }
};

export default ApproveParkings;
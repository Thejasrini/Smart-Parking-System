import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import API from '../../api/axios';

const TAMIL_NADU_CENTER = { lat: 11.1271, lng: 78.6569 };
const TAMIL_NADU_BOUNDS = [
  [8.0, 76.0],
  [13.8, 80.5]
];

const OwnerDashboard = () => {
  const [myParkings, setMyParkings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    revenue: 0,
    peakHours: {},
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const fetchDashboardData = async () => {
    try {
      const [parkingsRes, analyticsRes] = await Promise.all([
        API.get('/parking/mine'),
        API.get('/booking/analytics').catch(() => ({ data: null }))
      ]);

      setMyParkings(parkingsRes.data || []);
      
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      setMyParkings([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const refreshTimer = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    const handleRefreshSignal = () => {
      fetchDashboardData();
    };

    window.addEventListener('storage', handleRefreshSignal);
    window.addEventListener('focus', handleRefreshSignal);

    return () => {
      clearInterval(refreshTimer);
      window.removeEventListener('storage', handleRefreshSignal);
      window.removeEventListener('focus', handleRefreshSignal);
    };
  }, []);

  const stats = useMemo(() => ({
    total: myParkings.length,
    approved: myParkings.filter((p) => p.isApproved).length,
    pending: myParkings.filter((p) => !p.isApproved && !p.isRejected).length
  }), [myParkings]);

  const filteredParkings = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return myParkings;

    return myParkings.filter((parking) => {
      const name = parking.name?.toLowerCase() || '';
      const address = parking.location?.address?.toLowerCase() || '';
      const status = parking.isApproved ? 'approved' : parking.isRejected ? 'rejected' : 'pending';
      return name.includes(text) || address.includes(text) || status.includes(text);
    });
  }, [myParkings, searchText]);

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @media (max-width: 1100px) {
          .owner-dashboard-metrics,
          .owner-dashboard-content {
            grid-template-columns: 1fr !important;
          }

          .owner-dashboard-page {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }

        @media (max-width: 700px) {
          .owner-dashboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .owner-dashboard-actions {
            width: 100%;
          }

          .owner-dashboard-actions > a,
          .owner-dashboard-actions > a button {
            width: 100%;
          }

          .owner-dashboard-search {
            min-width: 0 !important;
            flex: 1 1 auto !important;
          }
        }

        .owner-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
          border-color: #ddd6fe;
        }

        .owner-btn:hover {
          transform: translateY(-1px);
        }

        .owner-btn-primary:hover {
          box-shadow: 0 10px 22px rgba(124, 58, 237, 0.3);
        }

        .owner-btn-secondary:hover {
          border-color: #a78bfa;
          color: #5b21b6;
          background: #f5f3ff;
        }

        .owner-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }
      `}</style>

      <div className="owner-dashboard-page" style={styles.container}>
        <p style={styles.kicker}>OWNER DASHBOARD</p>
        <h1 style={styles.title}>My Parkings</h1>
        <p style={styles.subtitle}>
          Manage your parking inventory, approval status, and location pins from one compact dashboard.
        </p>

        <div className="owner-dashboard-header" style={styles.headerRow}>
          <div className="owner-dashboard-search" style={styles.searchWrap}>
            <span style={styles.searchIcon}>⌕</span>
            <input
              className="owner-input"
              style={styles.searchInput}
              placeholder="Search parkings, location, status..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="owner-dashboard-actions" style={styles.actionButtons}>
            <Link to="/owner/add" style={styles.actionLink}>
              <button className="owner-btn owner-btn-primary" style={styles.primaryBtn}>＋ Add Parking</button>
            </Link>
            <Link to="/owner/requests" style={styles.actionLink}>
              <button className="owner-btn owner-btn-secondary" style={styles.secondaryBtn}>📩 View Requests</button>
            </Link>
          </div>
        </div>

        <div className="owner-dashboard-metrics" style={styles.metricsGrid}>
          <div className="owner-card" style={styles.metricCard}>
            <span style={styles.metricIcon}>🅿️</span>
            <p style={styles.metricLabel}>Total Parkings</p>
            <p style={{ ...styles.metricValue, color: '#7c3aed' }}>{stats.total}</p>
          </div>
          <div className="owner-card" style={styles.metricCard}>
            <span style={styles.metricIcon}>✅</span>
            <p style={styles.metricLabel}>Approved</p>
            <p style={{ ...styles.metricValue, color: '#16a34a' }}>{stats.approved}</p>
          </div>
          <div className="owner-card" style={styles.metricCard}>
            <span style={styles.metricIcon}>⏳</span>
            <p style={styles.metricLabel}>Pending</p>
            <p style={{ ...styles.metricValue, color: '#f59e0b' }}>{stats.pending}</p>
          </div>
          <div className="owner-card" style={styles.metricCard}>
            <span style={styles.metricIcon}>💰</span>
            <p style={styles.metricLabel}>Total Revenue</p>
            <p style={{ ...styles.metricValue, color: '#059669' }}>₹{analytics.revenue || 0}</p>
          </div>
          <div className="owner-card" style={styles.metricCard}>
            <span style={styles.metricIcon}>📅</span>
            <p style={styles.metricLabel}>Total Bookings</p>
            <p style={{ ...styles.metricValue, color: '#0891b2' }}>{analytics.totalBookings || 0}</p>
          </div>
        </div>

        <div className="owner-dashboard-content" style={styles.contentGrid}>
          <section className="owner-card" style={styles.listSection}>
            <div style={styles.sectionHeaderCompact}>
              <div>
                <p style={styles.sectionKicker}>PARKING LIST</p>
                <h2 style={styles.sectionTitle}>My Parking Entries</h2>
              </div>
              <span style={styles.badge}>{filteredParkings.length} items</span>
            </div>

            <div style={styles.listArea}>
              {filteredParkings.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>No parkings found</p>
                  <p style={styles.emptyText}>Add your first parking or clear the search filter.</p>
                  <Link to="/owner/add" style={styles.actionLink}>
                    <button className="owner-btn owner-btn-primary" style={{ ...styles.primaryBtn, width: 'fit-content' }}>
                      Add Parking
                    </button>
                  </Link>
                </div>
              ) : (
                filteredParkings.map((p) => (
                  <div key={p._id} className="owner-card" style={styles.parkingCard}>
                    <div style={styles.parkingTopRow}>
                      <div>
                        <h3 style={styles.parkingName}>{p.name}</h3>
                        <p style={styles.parkingLocation}>📍 {p.location?.address || 'Location not set'}</p>
                      </div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: p.isApproved ? '#ecfdf3' : p.isRejected ? '#fef2f2' : '#fff7ed',
                          color: p.isApproved ? '#15803d' : p.isRejected ? '#b91c1c' : '#d97706',
                          borderColor: p.isApproved ? '#bbf7d0' : p.isRejected ? '#fecaca' : '#fed7aa'
                        }}
                      >
                          {p.isApproved ? 'Approved' : p.isRejected ? 'Rejected' : 'Pending'}
                      </span>
                    </div>

                    <div style={styles.parkingMetaRow}>
                      <span style={styles.metaChip}>Slots: {p.availableSlots}/{p.totalSlots}</span>
                      <span style={styles.metaChip}>₹{p.price}/hr</span>
                    </div>

                    <div style={styles.quickActions}>
                      <button className="owner-btn owner-btn-secondary" style={styles.quickBtn}>Edit</button>
                      <button className="owner-btn owner-btn-secondary" style={styles.quickBtn}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="owner-card" style={styles.mapSection}>
            <div style={styles.sectionHeaderWhite}>
              <div>
                <p style={styles.sectionKicker}>MAP VIEW</p>
                <h2 style={styles.sectionTitle}>Your Parking Locations</h2>
              </div>
              <span style={styles.badgeSecondary}>{filteredParkings.length} markers</span>
            </div>

            <MapContainer
              center={[TAMIL_NADU_CENTER.lat, TAMIL_NADU_CENTER.lng]}
              zoom={8}
              style={styles.map}
              maxBounds={TAMIL_NADU_BOUNDS}
              maxBoundsViscosity={1.0}
              minZoom={7}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredParkings
                .filter((p) => p.location?.lat != null && p.location?.lng != null)
                .map((p) => (
                  <Marker key={p._id} position={[Number(p.location.lat), Number(p.location.lng)]}>
                    <Popup>
                      <strong>{p.name}</strong>
                      <p style={{ margin: '6px 0' }}>{p.location?.address}</p>
                      <p style={{ margin: 0 }}>Slots: {p.availableSlots}/{p.totalSlots}</p>
                      <p style={{ margin: 0 }}>Price: ₹{p.price}/hr</p>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </section>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '24px 16px 30px',
    backgroundColor: '#f3f4f8',
    fontFamily: 'Inter, Poppins, Segoe UI, sans-serif'
  },
  container: {
    width: '100%',
    maxWidth: 'none',
    margin: '0 auto'
  },
  kicker: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '800'
  },
  title: {
    margin: '8px 0 8px',
    fontSize: '26px',
    letterSpacing: '-0.04em',
    color: '#111827',
    lineHeight: 1,
    fontWeight: '800'
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
    maxWidth: '720px'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    marginTop: '16px'
  },
  searchWrap: {
    position: 'relative',
    minWidth: '280px',
    flex: '1 1 420px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '18px'
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px 12px 38px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    background: '#ffffff',
    fontSize: '14px',
    color: '#111827',
    transition: 'all 0.2s ease'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  actionLink: {
    textDecoration: 'none'
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  secondaryBtn: {
    border: '1.5px solid #ddd6fe',
    background: '#ffffff',
    color: '#5b21b6',
    padding: '12px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginTop: '18px'
  },
  metricCard: {
    border: '1px solid #e5e7eb',
    padding: '18px 18px 16px',
    minHeight: '104px',
    borderRadius: '14px',
    background: '#fff',
    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.05)',
    transition: 'all 0.22s ease'
  },
  metricIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: '#f5f3ff',
    color: '#7c3aed',
    marginBottom: '10px',
    fontSize: '14px'
  },
  metricLabel: {
    margin: 0,
    fontSize: '11px',
    color: '#6b7280',
    letterSpacing: '1.4px',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  metricValue: {
    margin: '10px 0 0',
    fontSize: '28px',
    lineHeight: 1,
    fontWeight: '800'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.18fr) minmax(0, 0.82fr)',
    gap: '16px',
    marginTop: '18px'
  },
  listSection: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)'
  },
  mapSection: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
    minHeight: '480px',
    minWidth: 0
  },
  sectionHeaderCompact: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  sectionHeaderWhite: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#ffffff',
    flexWrap: 'wrap'
  },
  sectionKicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '800'
  },
  sectionTitle: {
    margin: '4px 0 0',
    fontSize: '18px',
    lineHeight: 1,
    letterSpacing: '-0.02em',
    fontWeight: '800',
    color: '#111827'
  },
  badge: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#f5f3ff',
    color: '#5b21b6',
    fontSize: '12px',
    fontWeight: '700'
  },
  listArea: {
    maxHeight: '420px',
    overflowY: 'auto',
    paddingRight: '2px'
  },
  parkingCard: {
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '12px',
    transition: 'all 0.22s ease'
  },
  parkingTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start'
  },
  parkingName: {
    margin: 0,
    color: '#111827',
    fontSize: '18px',
    fontWeight: '800'
  },
  parkingLocation: {
    margin: '6px 0 0',
    color: '#6b7280',
    fontSize: '13px'
  },
  statusBadge: {
    border: '1px solid',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },
  parkingMetaRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '12px'
  },
  metaChip: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '600'
  },
  quickActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  quickBtn: {
    padding: '8px 12px',
    borderRadius: '10px',
    border: '1px solid #ddd6fe',
    background: '#fff',
    color: '#5b21b6',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  emptyState: {
    border: '1px dashed #d8b4fe',
    borderRadius: '14px',
    padding: '24px',
    textAlign: 'center',
    background: '#faf5ff'
  },
  emptyTitle: {
    margin: 0,
    color: '#111827',
    fontSize: '18px',
    fontWeight: '800'
  },
  emptyText: {
    margin: '8px 0 14px',
    color: '#6b7280',
    fontSize: '13px'
  },
  map: {
    width: '100%',
    height: '420px'
  }
};

export default OwnerDashboard;

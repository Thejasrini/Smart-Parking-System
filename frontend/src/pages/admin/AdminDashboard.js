import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import API from '../../api/axios';

const TAMIL_NADU_CENTER = { lat: 11.1271, lng: 78.6569 };
const TAMIL_NADU_BOUNDS = [
  [8.0, 76.0],
  [13.8, 80.5]
];

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], 8);
  }, [map, center]);

  return null;
};

const distanceKm = (aLat, aLng, bLat, bLng) => {
  const R = 6371;
  const dLat = (bLat - aLat) * (Math.PI / 180);
  const dLng = (bLng - aLng) * (Math.PI / 180);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(aLat * (Math.PI / 180)) * Math.cos(bLat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * y;
};

const getStatus = (parking) => {
  if (parking.availableSlots <= 0) return { text: 'LIKELY FULL', tone: '#ef4444', bg: '#fff1f2' };
  const ratio = parking.totalSlots > 0 ? parking.availableSlots / parking.totalSlots : 0;
  if (ratio < 0.35) return { text: 'FILLING', tone: '#c08200', bg: '#fff8e1' };
  return { text: 'AVAILABLE', tone: '#16a34a', bg: '#ecfdf3' };
};

const createSlotIcon = (parking, selected) => {
  const status = getStatus(parking);
  const border = selected ? '#111827' : status.tone;

  return L.divIcon({
    className: 'slot-badge-icon',
    html: `<div class="slot-badge" style="background:${status.bg}; border-color:${border}; color:${status.tone};">${parking.availableSlots}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
};

const AdminDashboard = () => {
  const [parkings, setParkings] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mapCenter, setMapCenter] = useState(TAMIL_NADU_CENTER);
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [searchPoint, setSearchPoint] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 980);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 980);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const res = await API.get('/parking/all');
        const withCoords = res.data.filter((p) => p.location?.lat != null && p.location?.lng != null);
        setParkings(withCoords);

        if (withCoords.length > 0) {
          setSelectedId(withCoords[0]._id);
          setMapCenter({ lat: Number(withCoords[0].location.lat), lng: Number(withCoords[0].location.lng) });
        }
      } catch (err) {
        setParkings([]);
      }
    };

    fetchParkings();
  }, []);

  const enriched = useMemo(() => {
    return parkings
      .map((p) => ({
        ...p,
        _distance: distanceKm(mapCenter.lat, mapCenter.lng, Number(p.location.lat), Number(p.location.lng)),
        _status: getStatus(p)
      }))
      .sort((a, b) => a._distance - b._distance);
  }, [parkings, mapCenter]);

  const selectedParking = useMemo(
    () => enriched.find((p) => p._id === selectedId) || null,
    [enriched, selectedId]
  );

  const handleSearchPlace = async () => {
    if (!query.trim()) return;

    setQueryError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`;
      const boundedUrl = `${url}&countrycodes=in&bounded=1&viewbox=76.0,13.8,80.5,8.0`;
      const res = await fetch(boundedUrl);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        setQueryError('No location found for that search');
        return;
      }

      const target = data[0];
      const lat = Number(target.lat);
      const lng = Number(target.lon);
      setMapCenter({ lat, lng });
      setSearchPoint({ lat, lng, label: target.display_name || 'Searched place' });
    } catch (err) {
      setQueryError('Search failed. Try again.');
    }
  };

  return (
    <div style={styles.page}>
      <style>{badgeCss}</style>

      <div style={styles.header}>
        <div style={styles.headerContainer}>
          <div>
            <p style={styles.kicker}>ADMIN DASHBOARD</p>
            <h1 style={styles.title}>Parking Overview</h1>
          </div>
          <div style={styles.searchRow}>
            <input
              style={styles.searchInput}
              value={query}
              placeholder="Search place in Tamil Nadu"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchPlace();
              }}
            />
            <button style={styles.searchBtn} type="button" onClick={handleSearchPlace}>Search</button>
          </div>
          {queryError && <p style={styles.error}>{queryError}</p>}
        </div>
      </div>

      <div
        style={{
          ...styles.layout,
          gridTemplateColumns: isMobile ? '1fr' : '380px 1fr',
          minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)'
        }}
      >
        <aside style={styles.sidebar}>
          <div style={styles.sideHeader}>
            <p style={styles.sideLabel}>NEARBY</p>
            <h2 style={styles.sideTitle}>Parking spots</h2>
            <p style={styles.sideSub}>{enriched.length} results · AI-predicted</p>
          </div>

          <div style={styles.sideList}>
            {enriched.map((p) => (
              <button
                key={p._id}
                type="button"
                style={{
                  ...styles.card,
                  borderLeft: selectedId === p._id ? '5px solid #3b82f6' : '5px solid transparent',
                  background: selectedId === p._id ? '#f0f9ff' : '#ffffff'
                }}
                onClick={() => {
                  setSelectedId(p._id);
                  setMapCenter({ lat: Number(p.location.lat), lng: Number(p.location.lng) });
                }}
              >
                <div style={styles.cardTop}>
                  <h3 style={styles.cardName}>{p.name}</h3>
                  <span style={{ ...styles.badge, color: p._status.tone, borderColor: p._status.tone, background: p._status.bg }}>
                    {p._status.text}
                  </span>
                </div>
                <p style={styles.cardAddress}>{p.location?.address || 'No address'}</p>
                <p style={styles.cardMeta}>
                  {p.availableSlots}/{p.totalSlots} slots · Rs {p.price}/hr · {p._distance.toFixed(2)} km
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section style={{ ...styles.mapWrap, minHeight: isMobile ? '58vh' : 'calc(100vh - 200px)' }}>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
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
            <RecenterMap center={mapCenter} />

            {enriched.map((p) => (
              <Marker
                key={p._id}
                position={[Number(p.location.lat), Number(p.location.lng)]}
                icon={createSlotIcon(p, selectedId === p._id)}
                eventHandlers={{
                  click: () => setSelectedId(p._id)
                }}
              >
                <Popup>
                  <strong>{p.name}</strong>
                  <p style={{ margin: '6px 0' }}>{p.location?.address || 'No address'}</p>
                  <p style={{ margin: 0 }}>Slots: {p.availableSlots}/{p.totalSlots}</p>
                  <p style={{ margin: 0 }}>Price: Rs {p.price}/hr</p>
                </Popup>
              </Marker>
            ))}

            {searchPoint && (
              <Marker position={[searchPoint.lat, searchPoint.lng]}>
                <Popup>
                  <strong>Searched place</strong>
                  <p style={{ margin: '6px 0 0' }}>{searchPoint.label}</p>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {selectedParking && (
            <div style={styles.footerBar}>
              <span style={styles.footerName}>{selectedParking.name}</span>
              <span style={styles.footerText}>{selectedParking.location?.address || 'No address'}</span>
              <span style={styles.footerText}>{selectedParking.availableSlots}/{selectedParking.totalSlots} slots</span>
              <span style={styles.footerText}>Rs {selectedParking.price}/hr</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '20px 0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  headerContainer: {
    width: 'min(1320px, 94vw)',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  kicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '700'
  },
  title: {
    margin: '6px 0 0',
    fontSize: '26px',
    letterSpacing: '-0.5px',
    color: '#111827',
    lineHeight: 1.1,
    fontWeight: '700'
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  searchInput: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    background: '#ffffff',
    color: '#111827',
    fontSize: '14px',
    minWidth: '280px',
    transition: 'all 0.2s'
  },
  searchBtn: {
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    fontWeight: '600',
    padding: '11px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  error: {
    margin: '8px 0 0',
    color: '#ef4444',
    fontSize: '14px',
    width: '100%'
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    minHeight: 'calc(100vh - 200px)'
  },
  sidebar: {
    background: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  sideHeader: {
    background: '#f9fafb',
    color: '#111827',
    padding: '18px 20px 14px',
    borderBottom: '1px solid #e5e7eb'
  },
  sideLabel: {
    margin: 0,
    fontSize: '10px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '700'
  },
  sideTitle: {
    margin: '8px 0 6px',
    fontSize: '20px',
    lineHeight: 1,
    letterSpacing: '-0.5px',
    color: '#111827',
    fontWeight: '700'
  },
  sideSub: {
    margin: '6px 0 0',
    color: '#6b7280',
    fontSize: '13px'
  },
  sideList: {
    overflowY: 'auto',
    flex: 1,
    background: '#f9fafb'
  },
  card: {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    alignItems: 'center'
  },
  cardName: {
    margin: 0,
    fontSize: '15px',
    color: '#111827',
    fontWeight: '600'
  },
  badge: {
    fontSize: '10px',
    fontWeight: '600',
    border: '1px solid',
    borderRadius: '6px',
    padding: '4px 8px',
    whiteSpace: 'nowrap'
  },
  cardAddress: {
    margin: '8px 0 6px',
    color: '#6b7280',
    fontSize: '13px'
  },
  cardMeta: {
    margin: 0,
    color: '#374151',
    fontSize: '13px',
    fontWeight: '500'
  },
  mapWrap: {
    position: 'relative',
    minHeight: 'calc(100vh - 200px)'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  footerBar: {
    position: 'absolute',
    left: '14px',
    right: '14px',
    bottom: '14px',
    background: 'rgba(17, 24, 39, 0.95)',
    color: '#fff',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
  },
  footerName: {
    fontWeight: '600',
    fontSize: '14px'
  },
  footerText: {
    opacity: 0.9,
    fontSize: '13px'
  }
};

const badgeCss = `
.slot-badge-icon {
  background: transparent;
  border: none;
}
.slot-badge {
  width: 40px;
  height: 40px;
  border-width: 2px;
  border-style: solid;
  border-radius: 4px;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 24px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}
@media (max-width: 980px) {
  .slot-badge {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
}
`;

export default AdminDashboard;

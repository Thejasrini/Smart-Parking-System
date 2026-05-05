import { useState, useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const TAMIL_NADU_CENTER = { lat: 11.1271, lng: 78.6569 };
const TAMIL_NADU_BOUNDS = [
  [8.0, 76.0],
  [13.8, 80.5]
];

const PRICE_OPTIONS = [
  { label: 'All Prices', value: 'all' },
  { label: '₹0 - ₹50', value: '0-50' },
  { label: '₹51 - ₹100', value: '51-100' },
  { label: '₹100 - ₹200', value: '100-200' },
  { label: '₹200 - ₹300', value: '200-300' },
  { label: '₹300+', value: '300+' },
  { label: 'Custom Range', value: 'custom' }
];

const DISTANCE_OPTIONS = [
  { label: 'All Distances', value: 'all' },
  { label: '0 - 5 km', value: '0-5' },
  { label: '5 - 10 km', value: '5-10' },
  { label: '10 - 20 km', value: '10-20' },
  { label: '20+ km', value: '20+' },
  { label: 'Custom Range', value: 'custom' }
];

const toMeridiemSlot = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const toTimeInputValue = (slot) => {
  if (!slot) return '';
  const match = slot.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return '';
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${minute}`;
};

const clampToTamilNadu = (lat, lng) => ({
  lat: Math.min(13.8, Math.max(8.0, lat)),
  lng: Math.min(80.5, Math.max(76.0, lng))
});

const statusTone = (parking) => {
  if (parking.availableSlots <= 0) return { bg: '#fff1f2', color: '#ef4444' };
  const ratio = parking.totalSlots > 0 ? parking.availableSlots / parking.totalSlots : 0;
  if (ratio < 0.35) return { bg: '#fff8e1', color: '#c08200' };
  return { bg: '#ecfdf3', color: '#16a34a' };
};

const createSlotIcon = (parking, selected) => {
  const tone = statusTone(parking);
  return L.divIcon({
    className: 'tn-slot-icon',
    html: `<div class="tn-slot-badge" style="background:${tone.bg};color:${tone.color};border-color:${selected ? '#111827' : tone.color}">${parking.availableSlots}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 8));
  }, [map, center]);

  return null;
};

const SearchParking = () => {
  const navigate = useNavigate();
  const [parkings, setParkings]         = useState([]);
  const [rawParkings, setRawParkings]   = useState([]);
  const [selected, setSelected]         = useState(null);
  const [userLocation, setUserLocation] = useState(TAMIL_NADU_CENTER);
  const [mapCenter, setMapCenter]       = useState(TAMIL_NADU_CENTER);
  const [message, setMessage]           = useState('');
  const [searchText, setSearchText]     = useState('');
  const [priceFilter, setPriceFilter]   = useState('all');
  const [customPriceMin, setCustomPriceMin] = useState('');
  const [customPriceMax, setCustomPriceMax] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [customDistanceMin, setCustomDistanceMin] = useState('');
  const [customDistanceMax, setCustomDistanceMax] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Get user's real location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = clampToTamilNadu(pos.coords.latitude, pos.coords.longitude);
      setUserLocation(loc);
      setMapCenter(loc);
      fetchParkings(loc.lat, loc.lng);
    }, () => {
      fetchParkings(TAMIL_NADU_CENTER.lat, TAMIL_NADU_CENTER.lng);
    });
  }, []);

  const fetchParkings = async (lat, lng) => {
    try {
      const res = await API.get(`/parking/search?lat=${lat}&lng=${lng}`);
      setRawParkings(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const filtered = (rawParkings || []).filter((p) => {
      const text = searchText.trim().toLowerCase();
      const byText = !text ||
        p.name?.toLowerCase().includes(text) ||
        p.location?.address?.toLowerCase().includes(text);

      const byPrice =
        (
          priceFilter === 'all' ||
          (priceFilter === '0-50' && p.price >= 0 && p.price <= 50) ||
          (priceFilter === '51-100' && p.price >= 51 && p.price <= 100) ||
          (priceFilter === '100-200' && p.price >= 100 && p.price <= 200) ||
          (priceFilter === '200-300' && p.price >= 200 && p.price <= 300) ||
          (priceFilter === '300+' && p.price >= 300) ||
          priceFilter === 'custom'
        ) &&
        (customPriceMin === '' || p.price >= Number(customPriceMin)) &&
        (customPriceMax === '' || p.price <= Number(customPriceMax));

      const dist = typeof p.distance === 'number' ? p.distance : 9999;
      const byDistance =
        (
          distanceFilter === 'all' ||
          (distanceFilter === '0-5' && dist <= 5) ||
          (distanceFilter === '5-10' && dist > 5 && dist <= 10) ||
          (distanceFilter === '10-20' && dist > 10 && dist <= 20) ||
          (distanceFilter === '20+' && dist > 20) ||
          distanceFilter === 'custom'
        ) &&
        (customDistanceMin === '' || dist >= Number(customDistanceMin)) &&
        (customDistanceMax === '' || dist <= Number(customDistanceMax));

      return byText && byPrice && byDistance;
    });

    setParkings(filtered);
  }, [rawParkings, searchText, priceFilter, customPriceMin, customPriceMax, distanceFilter, customDistanceMin, customDistanceMax]);

  // Get AI prediction when user clicks a parking
  const handleSelectParking = (parking) => {
    setSelected(parking);
    if (parking?.location?.lat != null && parking?.location?.lng != null) {
      setMapCenter({ lat: Number(parking.location.lat), lng: Number(parking.location.lng) });
    }
    setMessage('');
    // Navigate to parking details page with parking info and selected date/time
    navigate('/parking-details', { 
      state: { 
        parking
      } 
    });
  };



  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .tn-slot-icon { background: transparent; border: none; }
        .tn-slot-badge {
          width: 32px;
          height: 32px;
          border: 2px solid;
          border-radius: 4px;
          display: grid;
          place-items: center;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
        }

        .parking-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(17, 24, 39, 0.1);
          border-color: #c4b5fd;
        }

        .book-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
        }

        .filter-control:hover {
          border-color: #d6bcfa;
          box-shadow: 0 14px 26px rgba(124, 58, 237, 0.08);
          transform: translateY(-1px);
        }

        .field-control:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }
      `}</style>

      <div
        style={{
          ...styles.topBar,
          gridTemplateColumns: '1fr'
        }}
      >
        <div style={{ ...styles.topItemWide, borderRight: 'none' }}>
          <span style={styles.topLabel}>Where to park?</span>
          <input
            style={styles.topInput}
            className="field-control"
            placeholder="Search by area or parking name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div
        style={{
          ...styles.filterBar,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr'
        }}
      >
        <div className="filter-control" style={styles.filterControl}>
          <span style={styles.filterControlTitle}>Price Filter</span>
          <select
            className="field-control"
            style={{
              ...styles.filterSelect,
              ...(priceFilter !== 'all' ? styles.filterSelectActive : {})
            }}
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div style={styles.rangeRow}>
            <input
              type="number"
              min="0"
              placeholder="Min price (₹)"
              className="field-control"
              style={styles.rangeInput}
              value={customPriceMin}
              onChange={(e) => setCustomPriceMin(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max price (₹)"
              className="field-control"
              style={styles.rangeInput}
              value={customPriceMax}
              onChange={(e) => setCustomPriceMax(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-control" style={styles.filterControl}>
          <span style={styles.filterControlTitle}>Distance Filter</span>
          <select
            className="field-control"
            style={{
              ...styles.filterSelect,
              ...(distanceFilter !== 'all' ? styles.filterSelectActive : {})
            }}
            value={distanceFilter}
            onChange={(e) => setDistanceFilter(e.target.value)}
          >
            {DISTANCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <div style={styles.rangeRow}>
            <input
              type="number"
              min="0"
              placeholder="Min km"
              className="field-control"
              style={styles.rangeInput}
              value={customDistanceMin}
              onChange={(e) => setCustomDistanceMin(e.target.value)}
            />
            <input
              type="number"
              min="0"
              placeholder="Max km"
              className="field-control"
              style={styles.rangeInput}
              value={customDistanceMax}
              onChange={(e) => setCustomDistanceMax(e.target.value)}
            />
          </div>
        </div>

      </div>

      <div
        style={{
          ...styles.splitLayout,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1.55fr'
        }}
      >
        <div style={styles.listPane}>
          <div style={styles.listHeader}>Parking List</div>
          <div
            style={{
              ...styles.scrollArea,
              maxHeight: isMobile ? '42vh' : 'calc(100vh - 292px)'
            }}
          >
            {parkings.length === 0 && <p style={styles.emptyText}>No parkings match your filters.</p>}

            {parkings.map((p) => (
              <div
                key={p._id}
                className="parking-card"
                style={{
                  ...styles.card,
                  borderColor: selected?._id === p._id ? '#8b5cf6' : '#e5e7eb'
                }}
              >
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardLine}><span style={styles.cardIcon}>📍</span>{p.location?.address}</p>
                <p style={styles.cardLine}><span style={styles.cardIcon}>💸</span>₹{p.price}/hr</p>
                <p style={styles.cardLine}><span style={styles.cardIcon}>🟢</span>{p.availableSlots}/{p.totalSlots} slots available</p>
                {typeof p.distance === 'number' && <p style={styles.cardLine}><span style={styles.cardIcon}>🛣️</span>{p.distance.toFixed(2)} km away</p>}

                <button className="book-btn" style={styles.btn} onClick={() => handleSelectParking(p)}>
                  Select & Book
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.mapPane}>
          <div style={styles.listHeader}>Live Map</div>
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={8}
            style={{
              ...styles.map,
              height: isMobile ? '46vh' : 'calc(100vh - 292px)'
            }}
            maxBounds={TAMIL_NADU_BOUNDS}
            maxBoundsViscosity={1.0}
            minZoom={7}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap center={mapCenter} />

            {parkings
              .filter((p) => p.location?.lat != null && p.location?.lng != null)
              .map((p) => (
                <Marker
                  key={p._id}
                  position={[Number(p.location.lat), Number(p.location.lng)]}
                  icon={createSlotIcon(p, selected?._id === p._id)}
                  eventHandlers={{ click: () => handleSelectParking(p) }}
                >
                  <Popup>
                    <strong>{p.name}</strong>
                    <p style={{ margin: '6px 0' }}>{p.location?.address}</p>
                    <p style={{ margin: 0 }}>Slots: {p.availableSlots}/{p.totalSlots}</p>
                    <p style={{ margin: 0 }}>Price: ₹{p.price}/hr</p>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>

          {message && <p style={{ ...styles.message, color: message.includes('✅') ? '#15803d' : '#b91c1c' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '18px',
    background: '#f3f4f8',
    fontFamily: 'Inter, Poppins, Segoe UI, sans-serif'
  },
  topBar: {
    display: 'grid',
    border: '1px solid #e5e7eb',
    background: '#fff',
    marginBottom: '14px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)'
  },
  topItemWide: {
    padding: '14px 16px',
    borderRight: '1px solid #e5e7eb',
    minWidth: 0
  },
  topLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  topInput: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    transition: 'all 0.2s',
    color: '#111827',
    background: '#ffffff'
  },
  filterBar: {
    display: 'grid',
    gap: '12px',
    background: 'transparent',
    padding: '0',
    marginBottom: '14px',
    border: 'none',
    boxShadow: 'none'
  },
  filterControl: {
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.2s ease'
  },
  filterControlTitle: {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  filterSelect: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '11px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#111827',
    background: '#ffffff',
    transition: 'all 0.2s ease'
  },
  filterSelectActive: {
    borderColor: '#c4b5fd',
    boxShadow: '0 0 0 3px rgba(139, 92, 246, 0.09)'
  },
  rangeRow: {
    display: 'flex',
    gap: '8px'
  },
  rangeInput: {
    boxSizing: 'border-box',
    flex: 1,
    minWidth: 0,
    padding: '10px 12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#111827',
    background: '#ffffff',
    transition: 'all 0.2s ease'
  },
  dateTimeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px'
  },
  iconInputWrap: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    opacity: 0.85
  },
  iconInput: {
    boxSizing: 'border-box',
    width: '100%',
    padding: '10px 12px 10px 36px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.2s',
    color: '#111827',
    background: '#ffffff'
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.55fr',
    gap: '14px'
  },
  listPane: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)'
  },
  mapPane: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)'
  },
  listHeader: {
    padding: '16px 18px',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: '800',
    color: '#111827',
    fontSize: '20px',
    letterSpacing: '-0.02em'
  },
  scrollArea: {
    maxHeight: 'calc(100vh - 292px)',
    overflowY: 'auto',
    padding: '12px'
  },
  card: {
    background: '#fff',
    border: '1.5px solid #ede9fe',
    borderRadius: '14px',
    padding: '16px 16px 14px',
    marginBottom: '12px',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 20px rgba(17, 24, 39, 0.06)'
  },
  cardTitle: {
    margin: '0 0 10px',
    color: '#111827',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.01em'
  },
  cardIcon: {
    width: '20px',
    display: 'inline-block',
    textAlign: 'center',
    marginRight: '8px'
  },
  cardLine: {
    margin: '6px 0',
    color: '#4b5563',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },
  prediction: {
    margin: '8px 0',
    padding: '6px 12px',
    borderRadius: '8px',
    display: 'inline-block',
    fontSize: '12px',
    background: '#f0fdf4',
    color: '#166534',
    fontWeight: '600'
  },
  btn: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '11px',
    cursor: 'pointer',
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: '800',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  map: {
    height: 'calc(100vh - 292px)',
    width: '100%'
  },
  bookingPanel: {
    borderTop: '1px solid #e5e7eb',
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    background: '#f9fafb'
  },
  selectedName: {
    margin: 0,
    fontWeight: '700',
    color: '#111827',
    fontSize: '16px'
  },
  selectedMeta: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: '13px'
  },
  bookBtn: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  },
  emptyText: {
    color: '#6b7280',
    margin: '8px',
    textAlign: 'center',
    fontSize: '14px'
  },
  message: {
    margin: '8px 12px 12px',
    fontWeight: '600',
    padding: '10px 14px',
    borderRadius: '10px',
    background: '#f0fdf4',
    color: '#166534'
  }
};

export default SearchParking;
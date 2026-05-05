import { useState } from 'react';
import API from '../../api/axios';

const AddParking = () => {
  const [form, setForm] = useState({
    name: '', address: '', lat: '', lng: '', totalSlots: '', price: '', pricePerDay: '', images: [],
    features: {
      cctvAvailable: false,
      coveredParking: false,
      evCharging: false,
      security: false
    }
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        location: { address: form.address, lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
        totalSlots: parseInt(form.totalSlots),
        pricePerHour: parseFloat(form.price),
        pricePerDay: form.pricePerDay ? parseFloat(form.pricePerDay) : undefined,
        features: form.features,
        images: form.images
      };
      await API.post('/parking/add', payload);
      setMessage('✅ Parking added! Waiting for admin approval.');
      setForm({ name: '', address: '', lat: '', lng: '', totalSlots: '', price: '', pricePerDay: '', images: [], features: { cctvAvailable: false, coveredParking: false, evCharging: false, security: false } });
    } catch (err) {
      setMessage(err.response?.data?.message || '❌ Failed');
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .parking-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }

        .parking-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.28);
        }

        .parking-card:hover {
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
          border-color: #ddd6fe;
        }
      `}</style>

      <div style={styles.container}>
        <p style={styles.kicker}>NEW PARKING</p>
        <h1 style={styles.title}>Add Parking</h1>

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

        <div className="parking-card" style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <label style={styles.label}>
                <span style={styles.labelText}>Parking Name</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="name"
                  placeholder="Enter parking name"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Address</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="address"
                  placeholder="Full address"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Latitude</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="lat"
                  placeholder="e.g. 11.6643"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Longitude</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="lng"
                  placeholder="e.g. 78.1460"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Total Slots</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="totalSlots"
                  type="number"
                  placeholder="Number of slots"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Price per Hour (₹)</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="price"
                  type="number"
                  placeholder="Price in ₹"
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Price per Day (₹)</span>
                <input
                  className="parking-input"
                  style={styles.input}
                  name="pricePerDay"
                  type="number"
                  placeholder="Optional daily rate"
                  onChange={handleChange}
                />
              </label>
            </div>

            <div style={styles.featureSection}>
              <p style={styles.featureLabel}>🏢 Parking Features</p>
              <div style={styles.featureGrid}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.features.cctvAvailable}
                    onChange={(e) => setForm({ ...form, features: { ...form.features, cctvAvailable: e.target.checked } })}
                  />
                  <span>CCTV Available</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.features.coveredParking}
                    onChange={(e) => setForm({ ...form, features: { ...form.features, coveredParking: e.target.checked } })}
                  />
                  <span>Covered Parking</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.features.evCharging}
                    onChange={(e) => setForm({ ...form, features: { ...form.features, evCharging: e.target.checked } })}
                  />
                  <span>EV Charging</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.features.security}
                    onChange={(e) => setForm({ ...form, features: { ...form.features, security: e.target.checked } })}
                  />
                  <span>Security Guard</span>
                </label>
              </div>
            </div>

            <button className="parking-btn" style={styles.btn} type="submit">Add Parking</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '24px 0 30px',
    backgroundColor: '#f5f7fa'
  },
  container: {
    width: 'min(920px, 92vw)',
    margin: '0 auto'
  },
  kicker: {
    margin: 0,
    fontSize: '11px',
    letterSpacing: '1px',
    color: '#7c3aed',
    fontWeight: '800'
  },
  title: {
    margin: '8px 0 14px',
    fontSize: '24px',
    letterSpacing: '-0.04em',
    color: '#111827',
    lineHeight: 1,
    fontWeight: '800'
  },
  message: {
    padding: '12px 14px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '14px',
    border: '1px solid'
  },
  formCard: {
    border: '1px solid #e5e7eb',
    background: '#fff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
    transition: 'all 0.2s ease'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px'
  },
  label: {
    display: 'grid',
    gap: '5px',
    color: '#374151',
    fontWeight: '600',
    fontSize: '13px',
    letterSpacing: '0.2px'
  },
  labelText: {
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: '700',
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '11px',
    border: '1.5px solid #e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#ffffff',
    transition: 'all 0.2s'
  },
  featureSection: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    background: '#f9fafb'
  },
  featureLabel: {
    margin: '0 0 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151'
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500'
  },
  btn: {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.2px',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
  }
};

export default AddParking;
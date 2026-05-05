import { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const notAdded = 'Not Added';

const priceOptions = [
  '₹0 - ₹50',
  '₹51 - ₹100',
  '₹100 - ₹200',
  '₹200 - ₹300',
  '₹300+'
];

const distanceOptions = [
  '0 - 5 km',
  '5 - 10 km',
  '10 - 20 km',
  '20+ km'
];

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join('') || 'U';
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingAdditional, setEditingAdditional] = useState(false);
  const [editingBasic, setEditingBasic] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [lastLogin, setLastLogin] = useState('Just now');

  const [form, setForm] = useState({
    phoneNumber: '',
    vehicleType: '',
    vehicleNumber: '',
    location: ''
  });

  const [basicForm, setBasicForm] = useState({
    name: '',
    email: ''
  });

  const [preferences, setPreferences] = useState({
    preferredPriceRange: '₹51 - ₹100',
    preferredDistance: '0 - 5 km',
    favoriteLocations: '',
    emailAlerts: true,
    smsAlerts: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false
  });

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/profile');
      const profileData = res.data;
      setProfile(profileData);
      setForm({
        phoneNumber: profileData.phoneNumber || '',
        vehicleType: profileData.vehicleType || '',
        vehicleNumber: profileData.vehicleNumber || '',
        location: profileData.location || ''
      });
      setBasicForm({
        name: profileData.name || '',
        email: profileData.email || ''
      });
      setEditingAdditional(!profileData.isProfileComplete);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const previousLogin = localStorage.getItem('parkhubLastLogin');
    if (previousLogin) setLastLogin(previousLogin);
    localStorage.setItem('parkhubLastLogin', new Date().toLocaleString());

    const storedPreferences = localStorage.getItem('parkhubPreferences');
    if (storedPreferences) {
      try {
        setPreferences((prev) => ({ ...prev, ...JSON.parse(storedPreferences) }));
      } catch {
        // Ignore malformed local storage data
      }
    }

    loadProfile();
  }, []);

  const additionalInfo = useMemo(() => {
    return {
      phoneNumber: profile?.phoneNumber || '',
      vehicleType: profile?.vehicleType || '',
      vehicleNumber: profile?.vehicleNumber || '',
      location: profile?.location || ''
    };
  }, [profile]);

  const favoriteLocationTags = useMemo(() => {
    return preferences.favoriteLocations
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }, [preferences.favoriteLocations]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await API.put('/auth/profile', form);
      const updated = res.data.user;
      setProfile(updated);

      if (user) {
        updateUser({
          ...user,
          phoneNumber: updated.phoneNumber,
          vehicleType: updated.vehicleType,
          vehicleNumber: updated.vehicleNumber,
          location: updated.location,
          isProfileComplete: updated.isProfileComplete
        });
      }

      setEditingAdditional(false);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleBasicSave = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const name = basicForm.name.trim();
    const email = basicForm.email.trim();

    if (!name || !email) {
      setError('Name and email cannot be empty');
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name,
      email
    }));

    if (user) {
      updateUser({
        ...user,
        name,
        email
      });
    }

    setEditingBasic(false);
    setMessage('Basic info updated in current session');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('parkhubPreferences', JSON.stringify(preferences));
    setMessage('Parking preferences saved');
    setError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    try {
      const res = await API.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage(res.data.message || 'Password changed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loading}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(15, 23, 42, 0.08);
          border-color: #ddd6fe;
        }

        .profile-field:hover {
          border-color: #c4b5fd;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(124, 58, 237, 0.08);
        }

        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(124, 58, 237, 0.35);
        }

        .secondary-btn:hover {
          border-color: #a78bfa;
          color: #5b21b6;
          background: #f5f3ff;
        }

        .focus-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }
      `}</style>

      <div style={styles.container}>
        <header style={styles.pageHeader}>
          <div>
            <p style={styles.breadcrumb}>Account / Profile</p>
            <h1 style={styles.title}>Profile</h1>
          </div>

          <div style={styles.headerIdentity}>
            <div style={styles.avatarSmall}>{getInitials(profile?.name)}</div>
            <div>
              <p style={styles.headerName}>{profile?.name || 'User'}</p>
              <p style={styles.headerEmail}>{profile?.email || 'No email'}</p>
            </div>
          </div>
        </header>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <section className="profile-card" style={styles.overviewCard}>
          <div style={styles.overviewLeft}>
            <div style={styles.avatarLarge}>{getInitials(profile?.name)}</div>
            <div>
              <h2 style={styles.overviewName}>{profile?.name || 'User'}</h2>
              <p style={styles.overviewEmail}>{profile?.email || 'No email'}</p>
              <div style={styles.metaRow}>
                <span style={styles.metaBadge}>Active</span>
                <span style={styles.metaText}>Last login: {lastLogin}</span>
              </div>
            </div>
          </div>

          <button className="primary-btn" style={styles.primaryBtn} onClick={() => setEditingAdditional(true)}>
            Edit Profile
          </button>
        </section>

        <section className="profile-card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
            {editingBasic ? null : (
              <button className="secondary-btn" style={styles.secondaryBtn} onClick={() => setEditingBasic(true)}>
                ✏ Edit
              </button>
            )}
          </div>

          {editingBasic ? (
            <form style={styles.form} onSubmit={handleBasicSave}>
              <div style={styles.formGrid2}>
                <Field
                  label="Name"
                  value={basicForm.name}
                  placeholder="Enter your name"
                  onChange={(value) => setBasicForm({ ...basicForm, name: value })}
                />
                <Field
                  label="Email"
                  type="email"
                  value={basicForm.email}
                  placeholder="Enter your email"
                  onChange={(value) => setBasicForm({ ...basicForm, email: value })}
                />
              </div>

              <div style={styles.formButtons}>
                <button type="submit" className="primary-btn" style={styles.primaryBtn}>Save</button>
                <button
                  type="button"
                  className="secondary-btn"
                  style={styles.secondaryBtn}
                  onClick={() => {
                    setEditingBasic(false);
                    setBasicForm({
                      name: profile?.name || '',
                      email: profile?.email || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.infoGrid3}>
              <DisplayField label="Name" value={profile?.name || '-'} />
              <DisplayField label="Email" value={profile?.email || '-'} />
              <DisplayField label="Password" value="••••••••" />
            </div>
          )}
        </section>

        <section className="profile-card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Additional Information</h3>
            {editingAdditional ? null : (
              <button className="secondary-btn" style={styles.secondaryBtn} onClick={() => setEditingAdditional(true)}>
                ✏ Edit
              </button>
            )}
          </div>

          {editingAdditional ? (
            <form style={styles.form} onSubmit={handleSaveProfile}>
              <div style={styles.formGrid2}>
                <Field
                  label="📞 Phone Number"
                  value={form.phoneNumber}
                  placeholder="Enter phone number"
                  onChange={(value) => setForm({ ...form, phoneNumber: value })}
                />

                <label style={styles.label}>
                  <span style={styles.labelText}>🚗 Vehicle Type</span>
                  <select
                    className="focus-input"
                    style={styles.input}
                    value={form.vehicleType}
                    onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                  >
                    <option value="">Select vehicle type</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                  </select>
                </label>

                <Field
                  label="🚘 Vehicle Number"
                  value={form.vehicleNumber}
                  placeholder="Enter vehicle number"
                  onChange={(value) => setForm({ ...form, vehicleNumber: value })}
                />

                <Field
                  label="📍 Location"
                  value={form.location}
                  placeholder="Enter city or area"
                  onChange={(value) => setForm({ ...form, location: value })}
                />
              </div>

              <div style={styles.formButtons}>
                <button style={styles.primaryBtn} className="primary-btn" type="submit">Save Profile</button>
                <button
                  style={styles.secondaryBtn}
                  className="secondary-btn"
                  type="button"
                  onClick={() => {
                    setEditingAdditional(false);
                    setForm({
                      phoneNumber: profile?.phoneNumber || '',
                      vehicleType: profile?.vehicleType || '',
                      vehicleNumber: profile?.vehicleNumber || '',
                      location: profile?.location || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.infoGrid4}>
              <DisplayField label="📞 Phone Number" value={additionalInfo.phoneNumber || notAdded} />
              <DisplayField label="🚗 Vehicle Type" value={additionalInfo.vehicleType || notAdded} />
              <DisplayField label="🚘 Vehicle Number" value={additionalInfo.vehicleNumber || notAdded} />
              <DisplayField label="📍 Location" value={additionalInfo.location || notAdded} />
            </div>
          )}
        </section>

        <section className="profile-card" style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Parking Preferences</h3>
            <span style={styles.sectionSubtle}>Personalized parking recommendations</span>
          </div>

          <form style={styles.form} onSubmit={handleSavePreferences}>
            <div style={styles.formGrid3}>
              <label style={styles.label}>
                <span style={styles.labelText}>Preferred Price Range</span>
                <select
                  className="focus-input"
                  style={styles.input}
                  value={preferences.preferredPriceRange}
                  onChange={(e) => setPreferences({ ...preferences, preferredPriceRange: e.target.value })}
                >
                  {priceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                <span style={styles.labelText}>Preferred Distance</span>
                <select
                  className="focus-input"
                  style={styles.input}
                  value={preferences.preferredDistance}
                  onChange={(e) => setPreferences({ ...preferences, preferredDistance: e.target.value })}
                >
                  {distanceOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <Field
                label="Favorite Locations"
                value={preferences.favoriteLocations}
                placeholder="Ex: Erode, Salem, Coimbatore"
                onChange={(value) => setPreferences({ ...preferences, favoriteLocations: value })}
              />
            </div>

            {favoriteLocationTags.length > 0 ? (
              <div style={styles.tagsWrap}>
                {favoriteLocationTags.map((tag) => (
                  <span key={tag} style={styles.tagPill}>{tag}</span>
                ))}
              </div>
            ) : null}

            <div style={styles.toggleRow}>
              <Toggle
                label="Email Alerts"
                enabled={preferences.emailAlerts}
                onToggle={() => setPreferences({ ...preferences, emailAlerts: !preferences.emailAlerts })}
              />
              <Toggle
                label="SMS Alerts"
                enabled={preferences.smsAlerts}
                onToggle={() => setPreferences({ ...preferences, smsAlerts: !preferences.smsAlerts })}
              />
            </div>

            <button style={styles.primaryBtn} className="primary-btn" type="submit">Save Preferences</button>
          </form>
        </section>

        <section className="profile-card" style={styles.section}>
          <h3 style={styles.sectionTitle}>Change Password</h3>
          <form style={styles.form} onSubmit={handleChangePassword}>
            <PasswordField
              label="Current Password"
              value={passwordForm.currentPassword}
              type={showPassword.current ? 'text' : 'password'}
              onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
              onToggle={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
              visible={showPassword.current}
            />

            <PasswordField
              label="New Password"
              value={passwordForm.newPassword}
              type={showPassword.next ? 'text' : 'password'}
              onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              onToggle={() => setShowPassword({ ...showPassword, next: !showPassword.next })}
              visible={showPassword.next}
            />

            <PasswordField
              label="Confirm Password"
              value={passwordForm.confirmPassword}
              type={showPassword.confirm ? 'text' : 'password'}
              onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
              onToggle={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              visible={showPassword.confirm}
            />

            <button style={{ ...styles.primaryBtn, width: '100%' }} className="primary-btn" type="submit">
              Change Password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <input
      type={type}
      className="focus-input"
      style={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const DisplayField = ({ label, value }) => (
  <div className="profile-field" style={styles.infoCard}>
    <p style={styles.infoLabel}>{label}</p>
    <p style={styles.infoValue}>{value}</p>
  </div>
);

const Toggle = ({ label, enabled, onToggle }) => (
  <button type="button" style={styles.toggleBtn} onClick={onToggle}>
    <span style={styles.toggleLabel}>{label}</span>
    <span style={{ ...styles.switchTrack, ...(enabled ? styles.switchTrackEnabled : {}) }}>
      <span style={{ ...styles.switchThumb, ...(enabled ? styles.switchThumbEnabled : {}) }} />
    </span>
  </button>
);

const PasswordField = ({ label, value, type, onChange, onToggle, visible }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <div style={styles.passwordWrap}>
      <input
        type={type}
        className="focus-input"
        style={{ ...styles.input, ...styles.passwordInput }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()}`}
        required
      />
      <button type="button" style={styles.passwordToggle} onClick={onToggle}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  </label>
);

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '22px',
    background: '#f3f4f8',
    fontFamily: 'Inter, Poppins, Segoe UI, sans-serif'
  },
  container: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'grid',
    gap: '16px'
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  breadcrumb: {
    margin: 0,
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '600'
  },
  title: {
    margin: '4px 0 0',
    fontSize: '26px',
    lineHeight: 1,
    color: '#111827',
    letterSpacing: '-0.03em'
  },
  headerIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '10px 12px',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)'
  },
  avatarSmall: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: '700',
    fontSize: '15px',
    boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)'
  },
  headerName: {
    margin: 0,
    color: '#111827',
    fontWeight: '700',
    fontSize: '14px'
  },
  headerEmail: {
    margin: '2px 0 0',
    color: '#6b7280',
    fontSize: '12px'
  },
  overviewCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    background: 'linear-gradient(145deg, #ffffff 0%, #f7f3ff 100%)',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    transition: 'all 0.22s ease'
  },
  overviewLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  avatarLarge: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: '800',
    fontSize: '24px',
    boxShadow: '0 14px 30px rgba(124, 58, 237, 0.28)'
  },
  overviewName: {
    margin: 0,
    fontSize: '22px',
    color: '#111827',
    fontWeight: '800'
  },
  overviewEmail: {
    margin: '4px 0 0',
    color: '#6b7280',
    fontSize: '14px'
  },
  metaRow: {
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  metaBadge: {
    background: '#ecfdf3',
    color: '#15803d',
    border: '1px solid #bbf7d0',
    padding: '3px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  metaText: {
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500'
  },
  section: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.06)',
    padding: '18px',
    transition: 'all 0.22s ease'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
    flexWrap: 'wrap'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '22px',
    color: '#111827',
    fontWeight: '800',
    letterSpacing: '-0.02em'
  },
  sectionSubtle: {
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500'
  },
  infoGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  infoGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px'
  },
  infoCard: {
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fcfcff',
    padding: '14px',
    transition: 'all 0.2s ease'
  },
  infoLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  infoValue: {
    margin: '8px 0 0',
    color: '#111827',
    fontWeight: '700',
    fontSize: '16px',
    wordBreak: 'break-word'
  },
  form: {
    display: 'grid',
    gap: '14px'
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px'
  },
  formGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  label: {
    display: 'grid',
    gap: '6px'
  },
  labelText: {
    color: '#374151',
    fontSize: '13px',
    fontWeight: '700'
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    background: '#ffffff',
    padding: '11px 12px',
    fontSize: '14px',
    color: '#111827',
    transition: 'all 0.2s ease'
  },
  formButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  primaryBtn: {
    border: 'none',
    borderRadius: '12px',
    padding: '11px 18px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    boxShadow: '0 6px 14px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.22s ease'
  },
  secondaryBtn: {
    border: '1.5px solid #d1d5db',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    background: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.22s ease'
  },
  tagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tagPill: {
    border: '1px solid #ddd6fe',
    color: '#5b21b6',
    background: '#f5f3ff',
    padding: '5px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700'
  },
  toggleRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  toggleBtn: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    background: '#ffffff',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    minWidth: '210px',
    cursor: 'pointer'
  },
  toggleLabel: {
    color: '#111827',
    fontWeight: '600',
    fontSize: '13px'
  },
  switchTrack: {
    width: '38px',
    height: '22px',
    borderRadius: '999px',
    background: '#e5e7eb',
    position: 'relative',
    transition: 'all 0.2s ease'
  },
  switchTrackEnabled: {
    background: '#8b5cf6'
  },
  switchThumb: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#ffffff',
    position: 'absolute',
    left: '3px',
    top: '3px',
    transition: 'all 0.2s ease'
  },
  switchThumbEnabled: {
    left: '19px'
  },
  passwordWrap: {
    position: 'relative'
  },
  passwordInput: {
    paddingRight: '72px'
  },
  passwordToggle: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#6d28d9',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  success: {
    margin: 0,
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    fontWeight: '600',
    fontSize: '14px'
  },
  error: {
    margin: 0,
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    fontWeight: '600',
    fontSize: '14px'
  },
  loading: {
    color: '#6b7280',
    fontSize: '15px',
    padding: '40px',
    textAlign: 'center'
  }
};

export default Profile;

import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const getInitials = (name) => {
  if (!name) return 'O';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'O';
};

const OwnerProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myParkings, setMyParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });
  const [basicForm, setBasicForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    address: ''
  });
  const [businessForm, setBusinessForm] = useState({
    parkingName: '',
    parkingAddress: '',
    idProofUrl: '',
    gstNumber: ''
  });
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, parkingsRes] = await Promise.all([
        API.get('/auth/profile'),
        API.get('/parking/mine')
      ]);

      const profileData = profileRes.data;
      setProfile(profileData);
      setMyParkings(parkingsRes.data || []);

      setBasicForm({
        name: profileData.name || user?.name || '',
        email: profileData.email || user?.email || '',
        phoneNumber: profileData.phoneNumber || '',
        city: profileData.location || '',
        address: ''
      });

      // Load business details
      if (profileData.ownerBusiness) {
        setBusinessForm({
          parkingName: profileData.ownerBusiness.parkingName || '',
          parkingAddress: profileData.ownerBusiness.address || '',
          idProofUrl: profileData.ownerBusiness.idProofUrl || '',
          gstNumber: profileData.ownerBusiness.gstNumber || ''
        });
      }

      // Load bank details
      if (profileData.bankDetails) {
        setBankForm({
          accountHolderName: profileData.bankDetails.accountHolderName || '',
          accountNumber: profileData.bankDetails.accountNumber || '',
          ifscCode: profileData.bankDetails.ifscCode || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load owner profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const stats = {
    totalParkings: myParkings.length,
    approvedListings: myParkings.filter((p) => p.isApproved).length,
    pendingRequests: myParkings.filter((p) => !p.isApproved && !p.isRejected).length
  };

  const handleSaveBasic = (e) => {
    e.preventDefault();
    setMessage('Profile updated for this session');
    setError('');

    const updated = {
      ...user,
      name: basicForm.name.trim(),
      email: basicForm.email.trim()
    };

    updateUser(updated);
    setProfile((prev) => (prev ? { ...prev, name: updated.name, email: updated.email, location: basicForm.city } : prev));
    setEditingBasic(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

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

  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await API.put('/auth/profile', {
        ownerBusiness: {
          parkingName: businessForm.parkingName,
          address: businessForm.parkingAddress,
          idProofUrl: businessForm.idProofUrl,
          gstNumber: businessForm.gstNumber
        }
      });
      setMessage('Business details updated successfully');
      setEditingBusiness(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update business details');
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await API.put('/auth/profile', {
        bankDetails: {
          accountHolderName: bankForm.accountHolderName,
          accountNumber: bankForm.accountNumber,
          ifscCode: bankForm.ifscCode
        }
      });
      setMessage('Bank details updated successfully');
      setEditingBank(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bank details');
    }
  };

  if (loading) {
    return <div style={styles.page}><p style={styles.loading}>Loading owner profile...</p></div>;
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .profile-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
          border-color: #ddd6fe;
        }

        .profile-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.12);
        }

        .profile-btn:hover {
          transform: translateY(-1px);
        }

        .profile-btn-primary:hover {
          box-shadow: 0 10px 22px rgba(124, 58, 237, 0.3);
        }

        .profile-btn-secondary:hover {
          border-color: #a78bfa;
          color: #5b21b6;
          background: #f5f3ff;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.headerTop}>
          <div>
            <p style={styles.kicker}>OWNER PROFILE</p>
            <h1 style={styles.title}>Profile</h1>
            <p style={styles.subtitle}>Manage your owner account from one place.</p>
          </div>
          <button className="profile-btn profile-btn-primary" style={styles.primaryBtn} onClick={() => setEditingBasic(true)}>
            Edit Profile
          </button>
        </div>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <section className="profile-card" style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <div style={styles.avatar}>{getInitials(profile?.name || user?.name)}</div>
            <div>
              <div style={styles.heroMetaRow}>
                <span style={styles.roleBadge}>OWNER</span>
                <span style={styles.accountBadge}>Active</span>
              </div>
              <h2 style={styles.heroName}>{profile?.name || user?.name || 'Owner'}</h2>
              <p style={styles.heroEmail}>{profile?.email || user?.email || ''}</p>
            </div>
          </div>

          <div style={styles.heroStats}>
            <Stat label="Total Parkings" value={stats.totalParkings} />
            <Stat label="Approved Listings" value={stats.approvedListings} />
            <Stat label="Pending Requests" value={stats.pendingRequests} />
          </div>
        </section>

        <div style={styles.grid}>
          <section className="profile-card" style={styles.section}>
            <SectionHeader title="Basic Info" subtitle="Core account details" />
            {editingBasic ? (
              <form style={styles.form} onSubmit={handleSaveBasic}>
                <div style={styles.formGrid2}>
                  <Field label="Name" value={basicForm.name} onChange={(value) => setBasicForm({ ...basicForm, name: value })} />
                  <Field label="Email" type="email" value={basicForm.email} onChange={(value) => setBasicForm({ ...basicForm, email: value })} />
                  <Field label="Phone Number" value={basicForm.phoneNumber} onChange={(value) => setBasicForm({ ...basicForm, phoneNumber: value })} />
                  <Field label="City" value={basicForm.city} onChange={(value) => setBasicForm({ ...basicForm, city: value })} />
                </div>
                <Field label="Address" value={basicForm.address} onChange={(value) => setBasicForm({ ...basicForm, address: value })} />
                <div style={styles.buttonRow}>
                  <button type="submit" className="profile-btn profile-btn-primary" style={styles.primaryBtn}>Save</button>
                  <button
                    type="button"
                    className="profile-btn profile-btn-secondary"
                    style={styles.secondaryBtn}
                    onClick={() => setEditingBasic(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={styles.infoGrid3}>
                <InfoCard label="Name" value={profile?.name || user?.name || '-'} />
                <InfoCard label="Email" value={profile?.email || user?.email || '-'} />
                <InfoCard label="Phone Number" value={profile?.phoneNumber || 'Not added'} />
              </div>
            )}
          </section>

          <section className="profile-card" style={styles.section}>
            <SectionHeader title="Business Details" subtitle="Your parking business information" />
            {editingBusiness ? (
              <form style={styles.form} onSubmit={handleSaveBusiness}>
                <div style={styles.formGrid2}>
                  <Field label="Parking Name" value={businessForm.parkingName} onChange={(value) => setBusinessForm({ ...businessForm, parkingName: value })} />
                  <Field label="Parking Address" value={businessForm.parkingAddress} onChange={(value) => setBusinessForm({ ...businessForm, parkingAddress: value })} />
                  <Field label="GST Number" value={businessForm.gstNumber} onChange={(value) => setBusinessForm({ ...businessForm, gstNumber: value })} />
                  <Field label="ID Proof URL" value={businessForm.idProofUrl} onChange={(value) => setBusinessForm({ ...businessForm, idProofUrl: value })} />
                </div>
                <div style={styles.buttonRow}>
                  <button type="submit" className="profile-btn profile-btn-primary" style={styles.primaryBtn}>Save</button>
                  <button type="button" className="profile-btn profile-btn-secondary" style={styles.secondaryBtn} onClick={() => setEditingBusiness(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={styles.infoGrid3}>
                <InfoCard label="Parking Name" value={profile?.ownerBusiness?.parkingName || 'Not added'} />
                <InfoCard label="Address" value={profile?.ownerBusiness?.address || 'Not added'} />
                <InfoCard label="GST Number" value={profile?.ownerBusiness?.gstNumber || 'Not added'} />
              </div>
            )}
            {!editingBusiness && (
              <button className="profile-btn profile-btn-secondary" style={{ ...styles.secondaryBtn, width: '100%', marginTop: '12px' }} onClick={() => setEditingBusiness(true)}>
                Edit Business Details
              </button>
            )}
          </section>

          <section className="profile-card" style={styles.section}>
            <SectionHeader title="Bank Details" subtitle="Payment account information" />
            {editingBank ? (
              <form style={styles.form} onSubmit={handleSaveBank}>
                <div style={styles.formGrid2}>
                  <Field label="Account Holder Name" value={bankForm.accountHolderName} onChange={(value) => setBankForm({ ...bankForm, accountHolderName: value })} />
                  <Field label="Account Number" value={bankForm.accountNumber} onChange={(value) => setBankForm({ ...bankForm, accountNumber: value })} />
                  <Field label="IFSC Code" value={bankForm.ifscCode} onChange={(value) => setBankForm({ ...bankForm, ifscCode: value })} />
                </div>
                <div style={styles.buttonRow}>
                  <button type="submit" className="profile-btn profile-btn-primary" style={styles.primaryBtn}>Save</button>
                  <button type="button" className="profile-btn profile-btn-secondary" style={styles.secondaryBtn} onClick={() => setEditingBank(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={styles.infoGrid3}>
                <InfoCard label="Account Holder" value={profile?.bankDetails?.accountHolderName || 'Not added'} />
                <InfoCard label="Account Number" value={profile?.bankDetails?.accountNumber ? `****${profile.bankDetails.accountNumber.slice(-4)}` : 'Not added'} />
                <InfoCard label="IFSC Code" value={profile?.bankDetails?.ifscCode || 'Not added'} />
              </div>
            )}
            {!editingBank && (
              <button className="profile-btn profile-btn-secondary" style={{ ...styles.secondaryBtn, width: '100%', marginTop: '12px' }} onClick={() => setEditingBank(true)}>
                Edit Bank Details
              </button>
            )}
          </section>

          <section className="profile-card" style={styles.section}>
            <SectionHeader title="Account Settings" subtitle="Secure access and login controls" />
            <form style={styles.form} onSubmit={handleChangePassword}>
              <PasswordField
                label="Current Password"
                value={passwordForm.currentPassword}
                visible={showPasswords.current}
                onToggle={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
              />
              <PasswordField
                label="New Password"
                value={passwordForm.newPassword}
                visible={showPasswords.next}
                onToggle={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
              />
              <PasswordField
                label="Confirm Password"
                value={passwordForm.confirmPassword}
                visible={showPasswords.confirm}
                onToggle={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
              />
              <button className="profile-btn profile-btn-primary" style={{ ...styles.primaryBtn, width: '100%' }} type="submit">
                Change Password
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div style={styles.sectionHeader}>
    <div>
      <h3 style={styles.sectionTitle}>{title}</h3>
      <p style={styles.sectionSubtitle}>{subtitle}</p>
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text' }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <input
      className="profile-input"
      style={styles.input}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

const InfoCard = ({ label, value, accent }) => (
  <div className="profile-card" style={styles.infoCard}>
    <p style={styles.infoLabel}>{label}</p>
    <p style={{ ...styles.infoValue, ...(accent ? { color: accent } : {}) }}>{value}</p>
  </div>
);

const Stat = ({ label, value }) => (
  <div style={styles.statItem}>
    <p style={styles.statLabel}>{label}</p>
    <p style={styles.statValue}>{value}</p>
  </div>
);

const PasswordField = ({ label, value, visible, onToggle, onChange }) => (
  <label style={styles.label}>
    <span style={styles.labelText}>{label}</span>
    <div style={styles.passwordWrap}>
      <input
        className="profile-input"
        style={{ ...styles.input, ...styles.passwordInput }}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" style={styles.passwordBtn} onClick={onToggle}>
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  </label>
);

const styles = {
  page: {
    minHeight: 'calc(100vh - 74px)',
    padding: '24px 0 30px',
    backgroundColor: '#f3f4f8',
    fontFamily: 'Inter, Poppins, Segoe UI, sans-serif'
  },
  container: {
    width: 'min(1380px, 92vw)',
    margin: '0 auto'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
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
  primaryBtn: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    margin: 0,
    fontSize: '14px',
    fontWeight: '800'
  },
  secondaryBtn: {
    background: '#ffffff',
    color: '#5b21b6',
    border: '1px solid #ddd6fe',
    padding: '12px 20px',
    borderRadius: '12px',
    margin: 0,
    fontSize: '14px',
    fontWeight: '800'
  },
  success: {
    margin: '14px 0 0',
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    fontWeight: '600',
    fontSize: '14px'
  },
  error: {
    margin: '14px 0 0',
    padding: '12px 14px',
    borderRadius: '12px',
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    fontWeight: '600',
    fontSize: '14px'
  },
  heroCard: {
    marginTop: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    alignItems: 'center',
    padding: '22px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)'
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontSize: '24px',
    fontWeight: '900'
  },
  heroMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  roleBadge: {
    padding: '4px 9px',
    borderRadius: '999px',
    background: '#ede9fe',
    color: '#6d28d9',
    fontSize: '11px',
    fontWeight: '800'
  },
  accountBadge: {
    padding: '4px 9px',
    borderRadius: '999px',
    background: '#dcfce7',
    color: '#166534',
    fontSize: '11px',
    fontWeight: '800'
  },
  heroName: {
    margin: '8px 0 4px',
    fontSize: '22px',
    fontWeight: '900',
    color: '#111827'
  },
  heroEmail: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px'
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    minWidth: '340px'
  },
  statItem: {
    minWidth: '104px',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#fff'
  },
  statLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  statValue: {
    margin: '8px 0 0',
    color: '#7c3aed',
    fontSize: '24px',
    fontWeight: '900'
  },
  grid: {
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px'
  },
  section: {
    padding: '20px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)'
  },
  sectionHeader: {
    marginBottom: '14px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '900',
    color: '#111827'
  },
  sectionSubtitle: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#6b7280'
  },
  form: {
    display: 'grid',
    gap: '14px'
  },
  formGrid2: {
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
  buttonRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  infoGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  infoCard: {
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    background: '#fcfcff',
    padding: '14px'
  },
  infoLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '800',
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
  passwordWrap: {
    position: 'relative'
  },
  passwordInput: {
    paddingRight: '72px'
  },
  passwordBtn: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#6d28d9',
    fontSize: '12px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  loading: {
    color: '#6b7280',
    fontSize: '15px',
    padding: '40px',
    textAlign: 'center'
  }
};

export default OwnerProfile;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'user',
    showPassword: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setForm({ ...form, showPassword: !form.showPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      setSuccess('✅ Account created successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left Column - Register Form */}
        <div style={styles.formColumn}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h1 style={styles.title}>Create Account</h1>
              <p style={styles.subtitle}>Join us to find and book parking easily</p>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    style={styles.input}
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    style={styles.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    style={{...styles.input, paddingRight: '45px'}}
                    type={form.showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create a strong password"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={togglePasswordVisibility}
                  >
                    {form.showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Account Type</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </span>
                  <select style={styles.select} name="role" onChange={handleChange}>
                    <option value="user">🚗 User - Find & Book Parking</option>
                    <option value="owner">🅿️ Owner - Manage Your Parking</option>
                    <option value="admin">🛡️ Admin - System Administrator</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.btn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }} 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>

            <p style={styles.link}>
              Already have an account? <Link to="/login" style={styles.linkBold}>Sign in</Link>
            </p>
          </div>
        </div>

        {/* Right Column - Image */}
        <div style={styles.imageColumn}>
          <div style={styles.imageOverlay}>
            <div style={styles.imageContent}>
              <div style={styles.logoIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                  <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.2)"/>
                  <text x="12" y="16" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">P</text>
                </svg>
              </div>
              <h2 style={styles.imageTitle}>Smart Parking</h2>
              <p style={styles.imageSubtitle}>Find, book, and park in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Poppins', sans-serif",
    animation: 'fadeIn 0.5s ease-in'
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%'
  },
  formColumn: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#f5f7fa'
  },
  formCard: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px 36px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    animation: 'slideUp 0.6s ease-out'
  },
  formHeader: {
    marginBottom: '32px',
    textAlign: 'center'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '24px',
    color: '#111827',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '400'
  },
  error: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#fef2f2',
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid #fecaca',
    animation: 'shake 0.3s ease-in-out'
  },
  success: {
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#f0fdf4',
    color: '#166534',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '20px',
    border: '1px solid #bbf7d0',
    animation: 'shake 0.3s ease-in-out'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    letterSpacing: '0.3px'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#111827'
  },
  select: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: '8px',
    border: '1.5px solid #e5e7eb',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: '#111827',
    appearance: 'none'
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    opacity: 0.6
  },
  btn: {
    width: '100%',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
    fontFamily: 'inherit',
    letterSpacing: '0.3px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    '&::before, &::after': {
      content: '""',
      flex: '1',
      borderBottom: '1px solid #e5e7eb'
    }
  },
  dividerText: {
    padding: '0 12px',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  link: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#6b7280',
    textAlign: 'center'
  },
  linkBold: {
    color: '#7c3aed',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  imageColumn: {
    flex: '1',
    position: 'relative',
    backgroundImage: 'url(https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh'
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(124, 58, 237, 0.80) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px'
  },
  imageContent: {
    textAlign: 'center',
    maxWidth: '480px',
    animation: 'fadeIn 1s ease-in'
  },
  logoIcon: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'center'
  },
  imageTitle: {
    margin: '0 0 16px',
    fontSize: '30px',
    fontWeight: '700',
    lineHeight: 1.2,
    letterSpacing: '-1px',
    color: '#ffffff'
  },
  imageSubtitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.5
  }
};

export default Register;

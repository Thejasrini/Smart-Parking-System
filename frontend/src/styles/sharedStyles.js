// Shared styles for consistent theme across the entire application
// Import this file in any component to use common styles

export const theme = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    success: '#10b981',
    successDark: '#059669',
    danger: '#ef4444',
    dangerDark: '#dc2626',
    warning: '#f59e0b',
    bg: '#f3f4f6',
    white: '#ffffff',
    dark: '#05070c',
    text: '#020617',
    textSecondary: '#64748b',
    border: '#4b5563',
    borderLight: '#d1d5db'
  }
};

// Page background with grid pattern
export const pageStyle = {
  minHeight: 'calc(100vh - 74px)',
  padding: '22px 0',
  backgroundColor: '#f3f4f6',
  backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
  backgroundSize: '28px 28px'
};

// Container for content
export const container = {
  width: 'min(1320px, 94vw)',
  margin: '0 auto'
};

// Typography
export const kicker = {
  margin: 0,
  fontSize: '12px',
  letterSpacing: '1px',
  color: '#64748b',
  fontWeight: '700'
};

export const title = {
  margin: '8px 0 22px',
  fontSize: '28px',
  letterSpacing: '-1px',
  color: '#020617',
  lineHeight: 1
};

// Metric cards
export const metricsGrid = (columns = 4) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns}, minmax(180px, 1fr))`,
  border: '1px solid #4b5563',
  background: '#fff'
});

export const metricCard = {
  borderRight: '1px solid #4b5563',
  padding: '16px 20px',
  minHeight: '108px'
};

export const metricLabel = {
  margin: 0,
  fontSize: '11px',
  color: '#64748b',
  letterSpacing: '1.4px',
  fontWeight: '700'
};

export const metricValue = (color = '#1248b8') => ({
  margin: '10px 0 0',
  fontSize: '28px',
  lineHeight: 1,
  fontWeight: '800',
  color
});

// Section styles
export const section = {
  marginTop: '24px',
  border: '1px solid #4b5563',
  background: '#fff'
};

export const sectionHeader = {
  background: '#05070c',
  color: '#fff',
  padding: '16px 20px'
};

export const sectionKicker = {
  margin: 0,
  fontSize: '11px',
  letterSpacing: '1px',
  opacity: 0.88
};

export const sectionTitle = {
  margin: '4px 0 0',
  fontSize: '26px',
  lineHeight: 1,
  letterSpacing: '-0.6px'
};

// Button styles
export const primaryBtn = {
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '15px'
};

export const successBtn = {
  background: '#10b981',
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '15px'
};

export const dangerBtn = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '15px'
};

export const secondaryBtn = {
  border: '1px solid #334155',
  background: '#0b1220',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '700',
  borderRadius: '2px',
  padding: '10px 18px',
  cursor: 'pointer'
};

// Card styles
export const card = {
  padding: '20px',
  borderTop: '1px solid #d1d5db'
};

// Input styles
export const input = {
  width: '100%',
  padding: '12px',
  border: '1px solid #cbd5e1',
  borderRadius: '2px',
  fontSize: '15px',
  boxSizing: 'border-box'
};

export const select = {
  width: '100%',
  padding: '12px',
  border: '1px solid #cbd5e1',
  borderRadius: '2px',
  fontSize: '15px',
  boxSizing: 'border-box'
};

// Message styles
export const successMessage = {
  padding: '14px 18px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '15px',
  marginBottom: '20px',
  border: '1px solid',
  background: '#ecfdf5',
  color: '#065f46',
  borderColor: '#10b981'
};

export const errorMessage = {
  padding: '14px 18px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '15px',
  marginBottom: '20px',
  border: '1px solid',
  background: '#fef2f2',
  color: '#991b1b',
  borderColor: '#ef4444'
};

// Auth pages (Login/Register) styles
export const authContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f3f4f6',
  backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
  backgroundSize: '28px 28px',
  padding: '20px'
};

export const authBox = {
  background: '#fff',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '420px',
  border: '1px solid #d1d5db'
};

export const authTitle = {
  margin: '0 0 8px',
  fontSize: '24px',
  color: '#020617',
  fontWeight: '800'
};

export const authSubtitle = {
  margin: '0 0 24px',
  fontSize: '16px',
  color: '#64748b',
  fontWeight: '600'
};

export const authInput = {
  width: '100%',
  padding: '14px',
  margin: '10px 0',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '15px',
  boxSizing: 'border-box',
  background: '#f9fafb'
};

export const authBtn = {
  width: '100%',
  padding: '14px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '10px'
};

export const authLink = {
  marginTop: '20px',
  fontSize: '14px',
  color: '#64748b'
};

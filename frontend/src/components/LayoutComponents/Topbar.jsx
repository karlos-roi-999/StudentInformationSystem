import { useNavigate } from 'react-router-dom';

const Topbar = ({ userRole, onLogout }) => {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate('/');
  }

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 2rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: 600,
          backgroundColor: userRole === 'Admin' ? '#e5e7eb' : '#d1fae5',
          color: userRole === 'Admin' ? '#374151' : '#065f46'
        }}>
          {userRole}
        </span>
        <button onClick={handleLogout} style={{
          padding: '8px 18px',
          borderRadius: '8px',
          backgroundColor: '#111827',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
          fontFamily: 'Inter, sans-serif'
        }}>
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Topbar;

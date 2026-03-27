const StatCard = ({ label, value, icon: Icon }) => {
  return (
    <div style={{
      backgroundColor: 'white', borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        backgroundColor: '#f3f4f6', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={22} color="#111827" />
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827' }}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

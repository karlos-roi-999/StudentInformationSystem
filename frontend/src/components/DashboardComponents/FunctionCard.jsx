import { useNavigate } from 'react-router-dom';

const FunctionCard = ({ label, description, icon: Icon, to }) => {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(to)} style={{
      backgroundColor: 'white', borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      padding: '2rem', textAlign: 'center', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
      transition: 'box-shadow 0.2s'
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'}
    >
      <Icon size={28} color="#111827" />
      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{label}</h3>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{description}</p>
    </div>
  );
};

export default FunctionCard;

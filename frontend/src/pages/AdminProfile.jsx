import { User, Mail, Phone, Briefcase } from 'lucide-react';

const fieldRow = (icon, label, value) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  </div>
);

function AdminProfile({ userInfo }) {
  const name = userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}` : 'N/A';

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Profile</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Your faculty account details.</p>

      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '2rem', maxWidth: '600px'
      }}>
        {/* Profile avatar and name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#111827', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700
          }}>
            {userInfo ? (userInfo.first_name?.[0] || '') + (userInfo.last_name?.[0] || '') : '?'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{name}</h2>
            <span style={{
              padding: '4px 12px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
              backgroundColor: '#e5e7eb', color: '#374151', marginTop: '4px', display: 'inline-block'
            }}>
              {userInfo?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Account details */}
        {fieldRow(<Mail size={16} color="#6b7280" />, 'Email', userInfo?.email)}
        {fieldRow(<Phone size={16} color="#6b7280" />, 'Phone', userInfo?.phone_number)}
        {fieldRow(<Briefcase size={16} color="#6b7280" />, 'Position', userInfo?.position)}
        {fieldRow(<User size={16} color="#6b7280" />, 'User ID', userInfo?.id ? `#${userInfo.id}` : null)}
      </div>
    </div>
  );
}

export default AdminProfile;

const colors = {
  Active: { bg: '#d1fae5', text: '#065f46' },
  Enrolled: { bg: '#d1fae5', text: '#065f46' },
  Inactive: { bg: '#e5e7eb', text: '#374151' },
  Dropped: { bg: '#fef3c7', text: '#92400e' },
  Completed: { bg: '#dbeafe', text: '#1e40af' },
};

const StatusBadge = ({ status }) => {
  const c = colors[status] || { bg: '#e5e7eb', text: '#374151' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '99px',
      fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: c.bg, color: c.text
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;

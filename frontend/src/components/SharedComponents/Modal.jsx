const Modal = ({ title, onClose, children }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        width: '100%', maxWidth: '500px', maxHeight: '90vh',
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.25rem',
            cursor: 'pointer', color: '#6b7280'
          }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

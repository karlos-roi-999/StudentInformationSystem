import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageFaculty({ refresh, refreshTrigger }) {
  const [faculty, setFaculty] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { first_name: '', last_name: '', email: '', phone_number: '', position: 'Teacher' };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() { setEditingId(null); setFormData(initialForm); setShowModal(true); }
  function handleEditClick(f) {
    setEditingId(f.FacultyID || f.faculty_id);
    setFormData({
      first_name: f.FirstName || f.first_name || '',
      last_name: f.LastName || f.last_name || '',
      email: f.Email || f.email || '',
      phone_number: f.PhoneNumber || f.phone_number || '',
      position: f.Position || f.position || 'Teacher'
    });
    setShowModal(true);
  }

  useEffect(() => {
    axios.get('/api/faculty')
      .then(response => { setFaculty(response.data); })
      .catch(err => { console.error(`Error: ${err}`); });
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/faculty/${editingId}`, formData); }
      else { await axios.post('/api/faculty', formData); }
      setShowModal(false); refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this faculty member?')) return;
    try { await axios.delete(`/api/faculty/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Manage Faculty</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>View and register faculty profiles</p>
        </div>
        <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          <Plus size={16} /> Add Faculty
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Phone</th><th style={thStyle}>Position</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {faculty.length === 0 ? (
              <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No faculty found.</td></tr>
            ) : faculty.map(f => {
              const id = f.FacultyID || f.faculty_id;
              return (
                <tr
                  key={id}
                  onMouseEnter={() => setHoveredId(id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    transform: hoveredId === id ? 'scale(1.01)' : 'scale(1)',
                    boxShadow: hoveredId === id ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
                    transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease',
                    backgroundColor: hoveredId === id ? '#f9fafb' : 'transparent'
                  }}
                >
                  <td style={tdStyle}>{id}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{f.FirstName || f.first_name} {f.LastName || f.last_name}</td>
                  <td style={tdStyle}>{f.Email || f.email}</td>
                  <td style={tdStyle}>{f.PhoneNumber || f.phone_number || '-'}</td>
                  <td style={tdStyle}>{f.Position || f.position}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Faculty' : 'Add Faculty'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>First Name</label><input required name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Last Name</label><input required name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</label><input required type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Phone</label><input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Position</label>
            <select name="position" value={formData.position} onChange={handleChange} style={inputStyle}>
              <option value="Teacher">Teacher</option><option value="Department Head">Department Head</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Faculty</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageFaculty;

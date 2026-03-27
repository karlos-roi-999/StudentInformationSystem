import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageSupervises({ refresh, refreshTrigger }) {
  const [supervisions, setSupervisions] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ supervisor_id: '', supervisee_id: '' });

  useEffect(() => {
    Promise.all([
      axios.get('/api/supervises'),
      axios.get('/api/faculty')
    ])
      .then(([sRes, fRes]) => { setSupervisions(sRes.data); setFaculty(fRes.data); })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.supervisor_id === formData.supervisee_id) return alert('Cannot supervise themselves.');
    try { await axios.post('/api/supervises', formData); setShowModal(false); refresh(); }
    catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(supId, subId) {
    if (!window.confirm('Remove this supervision?')) return;
    try { await axios.delete('/api/supervises', { data: { supervisor_id: supId, supervisee_id: subId } }); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Faculty Supervision</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Assign faculty supervisors</p></div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Assign Supervisor</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Supervisor</th><th style={thStyle}>Supervisee</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {supervisions.length === 0 ? <tr><td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No supervisions set.</td></tr> :
            supervisions.map((s, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, fontWeight: 500 }}>{s.SupervisorFirstName || s.supervisor_first_name} {s.SupervisorLastName || s.supervisor_last_name}</td>
                <td style={tdStyle}>{s.SuperviseeFirstName || s.supervisee_first_name} {s.SuperviseeLastName || s.supervisee_last_name}</td>
                <td style={tdStyle}><button onClick={() => handleDelete(s.SupervisorID || s.supervisor_id, s.SuperviseeID || s.supervisee_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title="Assign Supervisor" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Supervisor</label>
            <select name="supervisor_id" value={formData.supervisor_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select supervisor...</option>
              {faculty.map(f => <option key={f.FacultyID || f.faculty_id} value={f.FacultyID || f.faculty_id}>{(f.FirstName || f.first_name)} {(f.LastName || f.last_name)} — {f.Position || f.position}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Supervisee</label>
            <select name="supervisee_id" value={formData.supervisee_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select supervisee...</option>
              {faculty.filter(f => String(f.FacultyID || f.faculty_id) !== String(formData.supervisor_id)).map(f => <option key={f.FacultyID || f.faculty_id} value={f.FacultyID || f.faculty_id}>{(f.FirstName || f.first_name)} {(f.LastName || f.last_name)}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageSupervises;

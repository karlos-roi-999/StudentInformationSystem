import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function ManageSchedules({ refresh, refreshTrigger }) {
  const [schedules, setSchedules] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { days_of_week: 'MWF', start_time: '08:00', end_time: '09:00' };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() { setEditingId(null); setFormData(initialForm); setShowModal(true); }
  function handleEditClick(s) {
    setEditingId(s.TimeSlotID || s.time_slot_id);
    setFormData({
      days_of_week: s.DaysOfWeek || s.days_of_week || 'MWF',
      start_time: (s.StartTime || s.start_time || '08:00:00').substring(0, 5),
      end_time: (s.EndTime || s.end_time || '09:00:00').substring(0, 5)
    });
    setShowModal(true);
  }

  useEffect(() => {
    axios.get('/api/schedules')
      .then(response => { setSchedules(response.data); })
      .catch(err => { console.error(`Error: ${err}`); });
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.end_time <= formData.start_time) return alert('End time must be after start time.');
    try {
      if (editingId) { await axios.put(`/api/schedules/${editingId}`, formData); }
      else { await axios.post('/api/schedules', formData); }
      setShowModal(false); refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this time slot?')) return;
    try { await axios.delete(`/api/schedules/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Time Slots</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Manage reusable class time blocks</p></div>
        <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Add Time Slot</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Days</th><th style={thStyle}>Start</th><th style={thStyle}>End</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {schedules.length === 0 ? <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No schedules found.</td></tr> :
            schedules.map(s => {
              const id = s.TimeSlotID || s.time_slot_id;
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
                  <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e5e7eb', color: '#374151' }}>{s.DaysOfWeek || s.days_of_week}</span></td>
                  <td style={tdStyle}>{formatTime(s.StartTime || s.start_time)}</td>
                  <td style={tdStyle}>{formatTime(s.EndTime || s.end_time)}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title={editingId ? 'Edit Time Slot' : 'Add Time Slot'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Days of Week</label>
            <select name="days_of_week" value={formData.days_of_week} onChange={handleChange} style={inputStyle}>
              <option value="MWF">MWF</option><option value="TTh">TTh</option><option value="Daily">Daily</option><option value="Sat">Saturday</option>
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Start Time</label><input required type="time" name="start_time" value={formData.start_time} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>End Time</label><input required type="time" name="end_time" value={formData.end_time} onChange={handleChange} style={inputStyle} />
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

export default ManageSchedules;

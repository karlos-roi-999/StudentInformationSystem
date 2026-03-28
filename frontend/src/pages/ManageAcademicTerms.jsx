import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageAcademicTerms({ refresh, refreshTrigger }) {
  const [terms, setTerms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { term_name: 'Fall', school_year: '', start_date: '', end_date: '' };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() { setEditingId(null); setFormData(initialForm); setShowModal(true); }
  function handleEditClick(t) {
    setEditingId(t.TermID || t.term_id);
    setFormData({
      term_name: t.TermName || t.term_name || 'Fall',
      school_year: String(t.SchoolYear || t.school_year || ''),
      start_date: (t.StartDate || t.start_date || '').toString().split('T')[0],
      end_date: (t.EndDate || t.end_date || '').toString().split('T')[0]
    });
    setShowModal(true);
  }

  useEffect(() => {
    axios.get('/api/academic-term')
      .then(response => { setTerms(response.data); })
      .catch(err => { console.error(`Error: ${err}`); });
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (new Date(formData.end_date) <= new Date(formData.start_date)) return alert('End date must be after start date.');
    try {
      if (editingId) { await axios.put(`/api/academic-term/${editingId}`, formData); }
      else { await axios.post('/api/academic-term', formData); }
      setShowModal(false); refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this term?')) return;
    try { await axios.delete(`/api/academic-term/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Academic Terms</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Manage semesters and school years</p></div>
        <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Add Term</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Term</th><th style={thStyle}>School Year</th><th style={thStyle}>Dates</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {terms.length === 0 ? <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No terms found.</td></tr> :
            terms.map(t => {
              const id = t.TermID || t.term_id;
              return (
                <tr key={id}>
                  <td style={tdStyle}>{id}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{t.TermName || t.term_name}</td>
                  <td style={tdStyle}>{t.SchoolYear || t.school_year}</td>
                  <td style={tdStyle}>{new Date(t.StartDate || t.start_date).toLocaleDateString()} — {new Date(t.EndDate || t.end_date).toLocaleDateString()}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title={editingId ? 'Edit Academic Term' : 'Add Academic Term'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Term Name</label>
            <select name="term_name" value={formData.term_name} onChange={handleChange} style={inputStyle}>
              <option value="Fall">Fall</option><option value="Winter">Winter</option><option value="Spring">Spring</option><option value="Summer">Summer</option>
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>School Year</label><input required name="school_year" value={formData.school_year} onChange={handleChange} placeholder="e.g. 2025-2026" style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Start Date</label><input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>End Date</label><input required type="date" name="end_date" value={formData.end_date} onChange={handleChange} style={inputStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Term</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageAcademicTerms;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManagePrerequisites({ refresh, refreshTrigger }) {
  const [prereqs, setPrereqs] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ course_id: '', prereq_course_id: '' });

  useEffect(() => {
    Promise.all([
      axios.get('/api/prerequisites'),
      axios.get('/api/course')
    ])
      .then(([pRes, cRes]) => { setPrereqs(pRes.data); setCourses(cRes.data); })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.course_id === formData.prereq_course_id) return alert('A course cannot be its own prerequisite.');
    try { await axios.post('/api/prerequisites', formData); setShowModal(false); refresh(); }
    catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(courseId, prereqId) {
    if (!window.confirm('Remove this prerequisite?')) return;
    try { await axios.delete('/api/prerequisites', { data: { course_id: courseId, prereq_course_id: prereqId } }); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Course Prerequisites</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Set prerequisite rules for courses</p></div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Add Prerequisite</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Requires</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {prereqs.length === 0 ? <tr><td colSpan="3" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No prerequisites set.</td></tr> :
            prereqs.map((p, i) => (
              <tr
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  transform: hoveredIdx === i ? 'scale(1.01)' : 'scale(1)',
                  boxShadow: hoveredIdx === i ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease',
                  backgroundColor: hoveredIdx === i ? '#f9fafb' : 'transparent'
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 500 }}>{p.CourseName || p.course_name}</td>
                <td style={tdStyle}>{p.PrerequisiteName || p.prerequisite_name}</td>
                <td style={tdStyle}><button onClick={() => handleDelete(p.CourseID || p.course_id, p.PrereqCourseID || p.prereq_course_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title="Add Prerequisite" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Course</label>
            <select name="course_id" value={formData.course_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select course...</option>
              {courses.map(c => <option key={c.CourseID || c.course_id} value={c.CourseID || c.course_id}>{c.CourseName || c.course_name}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Prerequisite Course</label>
            <select name="prereq_course_id" value={formData.prereq_course_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select prerequisite...</option>
              {courses.filter(c => String(c.CourseID || c.course_id) !== String(formData.course_id)).map(c => <option key={c.CourseID || c.course_id} value={c.CourseID || c.course_id}>{c.CourseName || c.course_name}</option>)}
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

export default ManagePrerequisites;

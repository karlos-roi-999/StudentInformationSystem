import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageCourses({ refresh, refreshTrigger }) {
  const [courses, setCourses] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { course_name: '', subject_area: 'Math', grade_level: '10', course_description: '' };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() { setEditingId(null); setFormData(initialForm); setShowModal(true); }
  function handleEditClick(c) {
    setEditingId(c.CourseID || c.course_id);
    setFormData({
      course_name: c.CourseName || c.course_name || '',
      subject_area: c.SubjectArea || c.subject_area || 'Math',
      grade_level: String(c.GradeLevel || c.grade_level || '10'),
      course_description: c.CourseDescription || c.course_description || ''
    });
    setShowModal(true);
  }

  useEffect(() => {
    axios.get('/api/course')
      .then(response => { setCourses(response.data); })
      .catch(err => { console.error(`Error: ${err}`); });
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/course/${editingId}`, formData); }
      else { await axios.post('/api/course', formData); }
      setShowModal(false); refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this course?')) return;
    try { await axios.delete(`/api/course/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Manage Courses</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>View and register school courses</p>
        </div>
        <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Course Name</th><th style={thStyle}>Subject</th><th style={thStyle}>Grade</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No courses found.</td></tr>
            ) : courses.map(c => {
              const id = c.CourseID || c.course_id;
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
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{c.CourseName || c.course_name}</td>
                  <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e5e7eb', color: '#374151' }}>{c.SubjectArea || c.subject_area}</span></td>
                  <td style={tdStyle}>{c.GradeLevel || c.grade_level}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Course' : 'Add Course'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Course Name</label><input required name="course_name" value={formData.course_name} onChange={handleChange} style={inputStyle} placeholder="e.g. Advanced Calculus" />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Subject Area</label>
            <select name="subject_area" value={formData.subject_area} onChange={handleChange} style={inputStyle}>
              <option value="Math">Math</option><option value="Science">Science</option><option value="English">English</option>
              <option value="History">History</option><option value="Physical Education">Physical Education</option><option value="Arts">Arts</option>
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Grade Level</label>
            <select name="grade_level" value={formData.grade_level} onChange={handleChange} style={inputStyle}>
              <option value="10">Grade 10</option><option value="11">Grade 11</option><option value="12">Grade 12</option>
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Description</label>
            <textarea name="course_description" value={formData.course_description} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }}></textarea>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Course</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageCourses;

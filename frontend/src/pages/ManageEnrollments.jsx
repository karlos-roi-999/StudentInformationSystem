import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageEnrollments({ refresh, refreshTrigger }) {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ student_id: '', course_offering_id: '', enrollment_status: 'Enrolled' });

  useEffect(() => {
    Promise.all([
      axios.get('/api/enrollments'),
      axios.get('/api/students'),
      axios.get('/api/course-offerings')
    ])
      .then(([eRes, sRes, oRes]) => {
        setEnrollments(eRes.data);
        setStudents(sRes.data);
        setOfferings(oRes.data);
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try { await axios.post('/api/enrollments', formData); setShowModal(false); refresh(); }
    catch (error) { alert('Error: ' + error.message); }
  }

  // Update Enrolment Status inline
  async function handleStatusChange(id, newStatus) {
    try { await axios.put(`/api/enrollments/${id}`, { enrollment_status: newStatus }); refresh(); }
    catch (error) { alert('Update failed: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this enrollment?')) return;
    try { await axios.delete(`/api/enrollments/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Student Enrolments</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Manage student enrolments and update status</p></div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Add Enrolment</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Student</th><th style={thStyle}>Course</th><th style={thStyle}>Section</th><th style={thStyle}>Status</th><th style={thStyle}>Update Status</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {enrollments.length === 0 ? <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No enrolments found.</td></tr> :
            enrollments.map(e => {
              const id = e.EnrollmentID || e.enrollment_id;
              const status = e.EnrollmentStatus || e.enrollment_status;
              return (
                <tr key={id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{e.StudentFirstName || e.student_first_name} {e.StudentLastName || e.student_last_name}</td>
                  <td style={tdStyle}>{e.CourseName || e.course_name}</td>
                  <td style={tdStyle}>{e.SectionName || e.section_name}</td>
                  <td style={tdStyle}><StatusBadge status={status} /></td>
                  <td style={tdStyle}>
                    <select value={status} onChange={(ev) => handleStatusChange(id, ev.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem', backgroundColor: '#fafafa' }}>
                      <option value="Enrolled">Enrolled</option><option value="Dropped">Dropped</option><option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td style={tdStyle}><button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title="Enrol Student" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Student</label>
            <select name="student_id" value={formData.student_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select student...</option>
              {students.map(s => <option key={s.StudentID || s.student_id} value={s.StudentID || s.student_id}>{(s.FirstName || s.first_name)} {(s.LastName || s.last_name)}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Course Offering</label>
            <select name="course_offering_id" value={formData.course_offering_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select offering...</option>
              {offerings.map(o => <option key={o.CourseOfferingID || o.course_offering_id} value={o.CourseOfferingID || o.course_offering_id}>{(o.CourseName || o.course_name)} — {(o.SectionName || o.section_name)}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Status</label>
            <select name="enrollment_status" value={formData.enrollment_status} onChange={handleChange} style={inputStyle}>
              <option value="Enrolled">Enrolled</option><option value="Dropped">Dropped</option><option value="Completed">Completed</option>
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

export default ManageEnrollments;

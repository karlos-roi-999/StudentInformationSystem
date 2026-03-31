import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageEnrollments({ refresh, refreshTrigger }) {
  const [enrollments, setEnrollments] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [students, setStudents] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [avgGrades, setAvgGrades] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [gradeModal, setGradeModal] = useState({ open: false, id: null, studentName: '', courseName: '', grade: '' });
  const [formData, setFormData] = useState({ student_id: '', course_offering_id: '', enrollment_status: 'Enrolled' });

  useEffect(() => {
    const sortParam = sortBy ? `?sort_by=${sortBy}` : '';
    Promise.all([
      axios.get(`/api/enrollments${sortParam}`),
      axios.get('/api/students'),
      axios.get('/api/course-offerings'),
      axios.get('/api/enrollments/avg-grades')
    ])
      .then(([eRes, sRes, oRes, avgRes]) => {
        setEnrollments(eRes.data);
        setStudents(sRes.data);
        setOfferings(oRes.data);
        setAvgGrades(avgRes.data);
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger, sortBy]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try { await axios.post('/api/enrollments', formData); setShowModal(false); refresh(); }
    catch (error) { alert(error.response?.data?.message || 'Error: ' + error.message); }
  }

  // Update Enrolment Status inline
  async function handleStatusChange(id, newStatus) {
    try { await axios.put(`/api/enrollments/${id}`, { enrollment_status: newStatus }); refresh(); }
    catch (error) { alert('Update failed: ' + error.message); }
  }

  // Open grade modal for a specific enrollment
  function openGradeModal(enrollment) {
    const id = enrollment.EnrollmentID || enrollment.enrollment_id;
    setGradeModal({
      open: true, id,
      studentName: `${enrollment.StudentFirstName || enrollment.student_first_name} ${enrollment.StudentLastName || enrollment.student_last_name}`,
      courseName: enrollment.CourseName || enrollment.course_name,
      grade: enrollment.grade != null ? String(enrollment.grade) : ''
    });
  }

  // Save grade from modal
  async function handleGradeSave() {
    const val = gradeModal.grade === '' ? null : parseFloat(gradeModal.grade);
    if (val !== null && (val < 1 || val > 100)) return alert('Grade must be between 1.00 and 100.00');
    try {
      await axios.put(`/api/enrollments/${gradeModal.id}`, { grade: val });
      setGradeModal({ ...gradeModal, open: false });
      refresh();
    } catch (error) { alert('Grade update failed: ' + error.message); }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', whiteSpace: 'nowrap' }}>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem', backgroundColor: '#fafafa', cursor: 'pointer' }}>
              <option value="">Default</option>
              <option value="student_name">Student Name</option>
              <option value="course_name">Course Name</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Add Enrolment</button>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Student</th><th style={thStyle}>Course</th><th style={thStyle}>Section</th><th style={thStyle}>Grade</th><th style={thStyle}>Status</th><th style={thStyle}>Update Status</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {enrollments.length === 0 ? <tr><td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No enrolments found.</td></tr> :
            enrollments.map(e => {
              const id = e.EnrollmentID || e.enrollment_id;
              const status = e.EnrollmentStatus || e.enrollment_status;
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
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{e.StudentFirstName || e.student_first_name} {e.StudentLastName || e.student_last_name}</td>
                  <td style={tdStyle}>{e.CourseName || e.course_name}</td>
                  <td style={tdStyle}>{e.SectionName || e.section_name}</td>
                  <td style={tdStyle}>
                    <button onClick={() => openGradeModal(e)} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#374151' }}>
                      {e.grade != null ? (
                        <span style={{ fontWeight: 600 }}>{e.grade}%</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>—</span>
                      )}
                      <Edit2 size={12} style={{ color: '#6b7280' }} />
                    </button>
                  </td>
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

      {/* Average Grade Per Course */}
      {avgGrades.length > 0 && (
        <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Average Grade Per Course</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Subject</th><th style={thStyle}>Avg Grade</th><th style={thStyle}>Graded / Enrolled</th></tr></thead>
            <tbody>
              {avgGrades.map(a => (
                <tr key={a.course_id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{a.course_name}</td>
                  <td style={tdStyle}><span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e5e7eb', color: '#374151' }}>{a.subject_area}</span></td>
                  <td style={tdStyle}>
                    <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: a.avg_grade >= 75 ? '#d1fae5' : a.avg_grade >= 50 ? '#fef3c7' : '#fef2f2', color: a.avg_grade >= 75 ? '#065f46' : a.avg_grade >= 50 ? '#92400e' : '#b91c1c' }}>
                      {a.avg_grade}%
                    </span>
                  </td>
                  <td style={tdStyle}>{a.graded_count} / {a.total_enrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grade Edit Modal */}
      {gradeModal.open && (
        <Modal title="Edit Grade" onClose={() => setGradeModal({ ...gradeModal, open: false })}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 4px' }}>Student</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{gradeModal.studentName}</p>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 4px' }}>Course</p>
            <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{gradeModal.courseName}</p>
          </div>
          <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Grade (1.00 — 100.00)</label>
          <input type="number" min="1" max="100" step="0.01"
            value={gradeModal.grade}
            onChange={(ev) => setGradeModal({ ...gradeModal, grade: ev.target.value })}
            placeholder="Enter grade..."
            style={inputStyle}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setGradeModal({ ...gradeModal, open: false })} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
            <button type="button" onClick={handleGradeSave} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Grade</button>
          </div>
        </Modal>
      )}
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

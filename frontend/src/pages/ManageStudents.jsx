import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa'
};
const thStyle = {
  padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left',
  fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em',
  color: '#6b7280', backgroundColor: '#fafafa'
};
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function ManageStudents({ refresh, refreshTrigger }) {
  const [students, setStudents] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = {
    first_name: '', last_name: '', email: '', phone_number: '',
    date_of_birth: '', grade_level: '10', enrollment_status: 'Active',
    student_type: 'FullTime',
    extra_curricular: '', guardian_contact_info: '',
    reason_for_part_time: '', hours_enrolled_per_week: ''
  };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  }

  // GET all students
  useEffect(() => {
    axios.get('/api/students')
      .then(response => { setStudents(response.data); })
      .catch(err => { console.error(`Error: ${err}`); });
  }, [refreshTrigger]);

  function handleChange(e) { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  }

  // POST or PUT student
  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.student_type === 'FullTime') {
      delete payload.reason_for_part_time;
      delete payload.hours_enrolled_per_week;
    } else {
      delete payload.extra_curricular;
      delete payload.guardian_contact_info;
      if (payload.hours_enrolled_per_week) payload.hours_enrolled_per_week = parseFloat(payload.hours_enrolled_per_week);
    }
    try {
      if (editingId) {
        await axios.put(`/api/students/${editingId}`, payload);
        alert("Student updated successfully");
      } else {
        await axios.post('/api/students', payload);
      }
      setShowModal(false);
      refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  function handleEditClick(student) {
    const id = student.StudentID || student.student_id;
    // student_type is now returned by the API via LEFT JOIN — 'FullTime', 'PartTime', or null
    const type = student.student_type || 'FullTime';
    setEditingId(id);
    setFormData({
      first_name: student.FirstName || '',
      last_name: student.LastName || '',
      email: student.Email || '',
      phone_number: student.PhoneNumber || '',
      date_of_birth: student.DateOfBirth ? String(student.DateOfBirth).split('T')[0] : '',
      grade_level: student.GradeLevel || '10',
      enrollment_status: student.EnrolmentStatus || 'Active',
      student_type: type,
      // Subclass fields — the API now includes these from the JOIN
      extra_curricular: student.ExtraCurricularActivities || '',
      guardian_contact_info: student.GuardianContactInfo || '',
      reason_for_part_time: student.ReasonForPartTime || '',
      hours_enrolled_per_week: student.HoursEnrolledPerWeek || ''
    });
    setShowModal(true);
  }

  // DELETE student
  async function handleDelete(id) {
    if (!window.confirm('Delete this student?')) return;
    if (!window.confirm('Are you sure about this action? Deleting a student is permanent and would delete them from the records of this school')) return;
    try {
      await axios.delete(`/api/students/${id}`);
      refresh();
    } catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Manage Students</h1>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>View and register student profiles</p>
        </div>
        <button onClick={handleAddClick} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          backgroundColor: '#111827', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
        }}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th><th style={thStyle}>Name</th><th style={thStyle}>Email</th>
              <th style={thStyle}>Grade</th><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No students found.</td></tr>
            ) : students.map(s => {
              const id = s.StudentID || s.student_id;
              const status = s.EnrolmentStatus || s.EnrollmentStatus || s.enrollment_status || 'Active';
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
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{s.FirstName || s.first_name} {s.LastName || s.last_name}</td>
                  <td style={tdStyle}>{s.Email || s.email}</td>
                  <td style={tdStyle}>{s.GradeLevel || s.grade_level}</td>
                  <td style={tdStyle}><StatusBadge status={status} /></td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <Modal title={editingId ? "Edit Student" : "Register New Student"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>First Name</label><input required name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Last Name</label><input required name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Email</label><input required type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Phone</label><input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Date of Birth</label><input required type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={inputStyle} /></div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Grade Level</label>
                <select name="grade_level" value={formData.grade_level} onChange={handleChange} style={inputStyle}>
                  <option value="10">Grade 10</option><option value="11">Grade 11</option><option value="12">Grade 12</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Status</label>
                <select name="enrollment_status" value={formData.enrollment_status} onChange={handleChange} style={inputStyle}>
                  <option value="Active">Active</option><option value="Inactive">Inactive</option>
                </select>
              </div>
              <div><label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Type</label>
                <select name="student_type" value={formData.student_type} onChange={handleChange} style={inputStyle}>
                  <option value="FullTime">Full-Time</option><option value="PartTime">Part-Time</option>
                </select>
              </div>
            </div>

            {formData.student_type === 'FullTime' ? (
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Full-Time Details</p>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Extra-Curricular</label><input name="extra_curricular" value={formData.extra_curricular} onChange={handleChange} style={inputStyle} />
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Guardian Contact</label><input name="guardian_contact_info" value={formData.guardian_contact_info} onChange={handleChange} style={inputStyle} />
              </div>
            ) : (
              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Part-Time Details</p>
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Reason</label><input name="reason_for_part_time" value={formData.reason_for_part_time} onChange={handleChange} style={inputStyle} />
                <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Hours / Week</label><input type="number" step="0.5" name="hours_enrolled_per_week" value={formData.hours_enrolled_per_week} onChange={handleChange} style={inputStyle} />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Student</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageStudents;

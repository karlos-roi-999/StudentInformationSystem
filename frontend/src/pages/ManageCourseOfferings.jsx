import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/SharedComponents/Modal.jsx';

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fafafa' };
const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function formatTime(t) { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; }

function ManageCourseOfferings({ refresh, refreshTrigger }) {
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { section_name: '', course_id: '', term_id: '', time_slot_id: '', faculty_id: '' };
  const [formData, setFormData] = useState(initialForm);

  function handleAddClick() { setEditingId(null); setFormData(initialForm); setShowModal(true); }
  function handleEditClick(o) {
    setEditingId(o.CourseOfferingID || o.course_offering_id);
    setFormData({
      section_name: o.SectionName || o.section_name || '',
      course_id: String(o.CourseID || o.course_id || ''),
      term_id: String(o.TermID || o.term_id || ''),
      time_slot_id: String(o.TimeSlotID || o.time_slot_id || ''),
      faculty_id: String(o.FacultyID || o.faculty_id || '')
    });
    setShowModal(true);
  }

  useEffect(() => {
    Promise.all([
      axios.get('/api/course-offerings'),
      axios.get('/api/course'),
      axios.get('/api/academic-term'),
      axios.get('/api/schedules'),
      axios.get('/api/faculty')
    ])
      .then(([oRes, cRes, tRes, sRes, fRes]) => {
        setOfferings(oRes.data);
        setCourses(cRes.data);
        setTerms(tRes.data);
        setSchedules(sRes.data);
        setFaculty(fRes.data);
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  function handleChange(e) { setFormData({ ...formData, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) { await axios.put(`/api/course-offerings/${editingId}`, formData); }
      else { await axios.post('/api/course-offerings', formData); }
      setShowModal(false); refresh();
    } catch (error) { alert('Error: ' + error.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this offering?')) return;
    try { await axios.delete(`/api/course-offerings/${id}`); refresh(); }
    catch (error) { alert('Delete failed: ' + error.message); }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Course Offerings</h1><p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Assign faculty and timeslots to courses per term</p></div>
        <button onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}><Plus size={16} /> Create Offering</button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Section</th><th style={thStyle}>Course</th><th style={thStyle}>Term</th><th style={thStyle}>Schedule</th><th style={thStyle}>Instructor</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {offerings.length === 0 ? <tr><td colSpan="6" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No offerings found.</td></tr> :
            offerings.map(o => {
              const id = o.CourseOfferingID || o.course_offering_id;
              return (
                <tr key={id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{o.SectionName || o.section_name}</td>
                  <td style={tdStyle}>{o.CourseName || o.course_name}</td>
                  <td style={tdStyle}>{(o.TermName || o.term_name)} {o.SchoolYear || o.school_year}</td>
                  <td style={tdStyle}>{o.DaysOfWeek || o.days_of_week} {formatTime(o.StartTime || o.start_time)}–{formatTime(o.EndTime || o.end_time)}</td>
                  <td style={tdStyle}>{o.FacultyFirstName || o.faculty_first_name} {o.FacultyLastName || o.faculty_last_name}</td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEditClick(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', marginRight: '12px' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal title={editingId ? 'Edit Course Offering' : 'Create Course Offering'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Section Name</label><input required name="section_name" value={formData.section_name} onChange={handleChange} placeholder="e.g. Section A" style={inputStyle} />
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Course</label>
            <select name="course_id" value={formData.course_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select a course...</option>
              {courses.map(c => <option key={c.CourseID || c.course_id} value={c.CourseID || c.course_id}>{c.CourseName || c.course_name}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Academic Term</label>
            <select name="term_id" value={formData.term_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select a term...</option>
              {terms.map(t => <option key={t.TermID || t.term_id} value={t.TermID || t.term_id}>{(t.TermName || t.term_name)} {t.SchoolYear || t.school_year}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Time Slot</label>
            <select name="time_slot_id" value={formData.time_slot_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select a time slot...</option>
              {schedules.map(s => <option key={s.TimeSlotID || s.time_slot_id} value={s.TimeSlotID || s.time_slot_id}>{(s.DaysOfWeek || s.days_of_week)} ({formatTime(s.StartTime || s.start_time)} – {formatTime(s.EndTime || s.end_time)})</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Instructor</label>
            <select name="faculty_id" value={formData.faculty_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select faculty...</option>
              {faculty.map(f => <option key={f.FacultyID || f.faculty_id} value={f.FacultyID || f.faculty_id}>{(f.FirstName || f.first_name)} {(f.LastName || f.last_name)}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'transparent', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#111827', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save Offering</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageCourseOfferings;

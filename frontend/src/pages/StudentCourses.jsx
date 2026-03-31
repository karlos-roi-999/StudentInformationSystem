import { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function formatTime(t) { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; }

function StudentCourses({ refresh, refreshTrigger, userInfo }) {
  const [tab, setTab] = useState('browse'); // 'browse' | 'my'
  const [offerings, setOfferings] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [enrolling, setEnrolling] = useState(false);

  const STUDENT_ID = userInfo?.id;

  useEffect(() => {
    Promise.all([
      axios.get('/api/course-offerings'),
      axios.get('/api/enrollments')
    ])
      .then(([oRes, eRes]) => {
        setOfferings(oRes.data);
        setMyEnrollments(eRes.data.filter(e => (e.StudentID || e.student_id) == STUDENT_ID));
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  async function handleEnrol(offeringId) {
    setEnrolling(true);
    try {
      await axios.post('/api/enrollments', { student_id: STUDENT_ID, course_offering_id: offeringId, enrollment_status: 'Enrolled' });
      alert('Enrolled successfully!');
      refresh();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert('Enrolment failed: ' + msg);
    }
    setEnrolling(false);
  }

  async function handleDrop(enrollmentId) {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    try {
      await axios.put(`/api/enrollments/${enrollmentId}`, { enrollment_status: 'Dropped' });
      refresh();
    } catch (error) { alert('Drop failed: ' + error.message); }
  }

  const tabBtn = (name, label) => (
    <button onClick={() => setTab(name)} style={{
      padding: '10px 24px', border: 'none', cursor: 'pointer',
      borderBottom: tab === name ? '3px solid #111827' : '3px solid transparent',
      fontWeight: tab === name ? 600 : 400,
      color: tab === name ? '#111827' : '#6b7280',
      backgroundColor: 'transparent', fontSize: '0.9rem'
    }}>{label}</button>
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Courses</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Browse course offerings and manage enrolments.</p>

      {/* Tab buttons */}
      <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        {tabBtn('browse', 'View Course Listings')}
        {tabBtn('my', 'My Courses')}
      </div>

      {/* Browse available courses */}
      {tab === 'browse' && (() => {
        // Only show courses that match this student's grade level
        const studentGrade = userInfo?.grade_level;
        const filtered = studentGrade
          ? offerings.filter(o => String(o.grade_level) === String(studentGrade))
          : offerings;

        return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {filtered.length === 0 ? <p style={{ color: '#9ca3af' }}>No offerings available for your grade level.</p> :
          filtered.map(o => {
            const id = o.CourseOfferingID || o.course_offering_id;

            // See if this student is already enrolled in this section
            const enrollment = myEnrollments.find(e =>
              (e.course_offering_id) == id && (e.enrollment_status) === 'Enrolled'
            );
            const isEnrolled = !!enrollment;

            return (
              <div key={id} style={{
                backgroundColor: 'white', borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '1.5rem',
                display: 'flex', flexDirection: 'column',
                border: isEnrolled ? '2px solid #10b981' : '2px solid transparent'
              }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{o.CourseName || o.course_name}</h3>
                <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: '#e5e7eb', color: '#374151', alignSelf: 'flex-start', marginBottom: '1rem' }}>
                  {o.SubjectArea || o.subject_area} — {o.SectionName || o.section_name}
                </span>
                <div style={{ color: '#6b7280', fontSize: '0.85rem', flex: 1 }}>
                  <p style={{ marginBottom: '6px' }}><strong>Term:</strong> {o.TermName || o.term_name} {o.SchoolYear || o.school_year}</p>
                  <p style={{ marginBottom: '6px' }}><strong>Schedule:</strong> {o.DaysOfWeek || o.days_of_week} {formatTime(o.StartTime || o.start_time)}–{formatTime(o.EndTime || o.end_time)}</p>
                  <p><strong>Instructor:</strong> {o.FacultyFirstName || o.faculty_first_name} {o.FacultyLastName || o.faculty_last_name}</p>
                </div>

                {isEnrolled ? (
                  <div style={{
                    marginTop: '1rem', padding: '10px', borderRadius: '8px',
                    backgroundColor: '#d1fae5', color: '#065f46',
                    fontWeight: 600, fontSize: '0.85rem', textAlign: 'center'
                  }}>✓ Enrolled</div>
                ) : (
                  <button disabled={enrolling} onClick={() => handleEnrol(id)} style={{
                    marginTop: '1rem', padding: '10px', borderRadius: '8px',
                    backgroundColor: '#111827', color: 'white', border: 'none',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center'
                  }}>Enrol Now</button>
                )}
              </div>
            );
          })}
        </div>
        );
      })()}

      {/* Student's enrolled courses */}
      {tab === 'my' && (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Section</th><th style={thStyle}>Schedule</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
            <tbody>
              {myEnrollments.length === 0 ? <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>You haven't enrolled in any courses yet.</td></tr> :
              myEnrollments.map(e => {
                const id = e.EnrollmentID || e.enrollment_id;
                const status = e.EnrollmentStatus || e.enrollment_status;
                return (
                  <tr key={id}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{e.CourseName || e.course_name}</td>
                    <td style={tdStyle}>{e.SectionName || e.section_name}</td>
                    <td style={tdStyle}>{e.DaysOfWeek || e.days_of_week || '-'} {formatTime(e.StartTime || e.start_time)}–{formatTime(e.EndTime || e.end_time)}</td>
                    <td style={tdStyle}><StatusBadge status={status} /></td>
                    <td style={tdStyle}>
                      {status === 'Enrolled' && (
                        <button onClick={() => handleDrop(id)} style={{
                          padding: '6px 14px', borderRadius: '6px', border: '1px solid #fca5a5',
                          backgroundColor: '#fef2f2', color: '#b91c1c', cursor: 'pointer',
                          fontWeight: 600, fontSize: '0.8rem'
                        }}>Drop</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentCourses;

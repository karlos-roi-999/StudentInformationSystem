import { useEffect, useState } from 'react';
import axios from 'axios';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const thStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', backgroundColor: '#fafafa' };
const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #f3f4f6' };

function StudentDashboard({ refreshTrigger, userInfo }) {
  const [enrollments, setEnrollments] = useState([]);

  const STUDENT_ID = userInfo?.id;

  useEffect(() => {
    axios.get('/api/enrollments')
      .then(response => {
        const mine = response.data.filter(e =>
          (e.StudentID || e.student_id) == STUDENT_ID
        );
        setEnrollments(mine);
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Dashboard</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Welcome! Here's your current schedule.</p>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>My Enrolled Courses</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={thStyle}>Course</th><th style={thStyle}>Section</th><th style={thStyle}>Term</th><th style={thStyle}>Status</th><th style={thStyle}>Grade</th></tr></thead>
          <tbody>
            {enrollments.length === 0 ? <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>You are not enrolled in any courses.</td></tr> :
            enrollments.map(e => {
              const id = e.EnrollmentID || e.enrollment_id;
              const status = e.EnrollmentStatus || e.enrollment_status;
              return (
                <tr key={id}>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{e.CourseName || e.course_name}</td>
                  <td style={tdStyle}>{e.SectionName || e.section_name}</td>
                  <td style={tdStyle}>{(e.TermName || e.term_name)} {e.SchoolYear || e.school_year}</td>
                  <td style={tdStyle}><StatusBadge status={status} /></td>
                  <td style={tdStyle}>
                    {e.grade != null ? (
                      <span style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: e.grade >= 75 ? '#d1fae5' : e.grade >= 50 ? '#fef3c7' : '#fef2f2', color: e.grade >= 75 ? '#065f46' : e.grade >= 50 ? '#92400e' : '#b91c1c' }}>
                        {e.grade}%
                      </span>
                    ) : <span style={{ color: '#9ca3af' }}>N/A</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentDashboard;

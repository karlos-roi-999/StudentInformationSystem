import { useEffect, useState } from 'react';
import axios from 'axios';

function formatTime(t) { if (!t) return ''; const [h, m] = t.split(':'); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; }

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

// Map day codes to column indices
function getDayIndices(daysOfWeek) {
  if (!daysOfWeek) return [];
  const map = { 'M': 0, 'T': 1, 'W': 2, 'Th': 3, 'F': 4 };
  if (daysOfWeek === 'MWF') return [0, 2, 4];
  if (daysOfWeek === 'TTh') return [1, 3];
  if (daysOfWeek === 'Daily') return [0, 1, 2, 3, 4];
  return [];
}

const colors = ['#dbeafe', '#d1fae5', '#fef3c7', '#fce7f3', '#ede9fe', '#e0e7ff'];

function StudentSchedule({ refreshTrigger, userInfo }) {
  const [enrollments, setEnrollments] = useState([]);
  const STUDENT_ID = userInfo?.id;

  useEffect(() => {
    axios.get('/api/enrollments')
      .then(response => {
        setEnrollments(response.data.filter(
          e => ((e.StudentID || e.student_id) == STUDENT_ID) && ((e.EnrollmentStatus || e.enrollment_status) === 'Enrolled')
        ));
      })
      .catch(err => console.error('Error:', err));
  }, [refreshTrigger]);

  // Build timetable grid
  function getBlocksForCell(dayIdx, hour) {
    return enrollments.filter(e => {
      const startHour = parseInt((e.StartTime || e.start_time || '').split(':')[0]);
      const dayIndices = getDayIndices(e.DaysOfWeek || e.days_of_week);
      return startHour === hour && dayIndices.includes(dayIdx);
    });
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Schedule</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Weekly timetable of your enrolled courses.</p>

      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', width: '80px', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>Time</th>
              {days.map(d => <th key={d} style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td style={{ padding: '8px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
                  {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                </td>
                {days.map((_, dayIdx) => {
                  const blocks = getBlocksForCell(dayIdx, hour);
                  return (
                    <td key={dayIdx} style={{ padding: '4px', height: '60px', verticalAlign: 'top', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f9fafb' }}>
                      {blocks.map((b, i) => (
                        <div key={i} style={{
                          backgroundColor: colors[i % colors.length],
                          borderRadius: '8px', padding: '6px 8px', fontSize: '0.75rem',
                          fontWeight: 500, lineHeight: 1.3
                        }}>
                          {b.CourseName || b.course_name}
                          <br/>
                          <span style={{ fontWeight: 400, fontSize: '0.65rem', color: '#6b7280' }}>
                            {formatTime(b.StartTime || b.start_time)}–{formatTime(b.EndTime || b.end_time)}
                          </span>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentSchedule;

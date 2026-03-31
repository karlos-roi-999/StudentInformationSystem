import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, GraduationCap, Calendar } from 'lucide-react';
import StatusBadge from '../components/SharedComponents/StatusBadge.jsx';

const fieldRow = (icon, label, value) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  </div>
);

function StudentProfile({ userInfo }) {
  const [student, setStudent] = useState(null);

  // Load full student record from the API (localStorage only has basic info)
  useEffect(() => {
    if (!userInfo?.id) return;
    axios.get(`/api/students/${userInfo.id}`)
      .then(response => { setStudent(response.data); })
      .catch(err => { console.error('Error fetching profile:', err); });
  }, [userInfo]);

  // Combine API data with localStorage as fallback
  const data = student || userInfo || {};
  const firstName = data.FirstName || data.first_name || '';
  const lastName = data.LastName || data.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || 'N/A';
  const email = data.Email || data.email || userInfo?.email || '';
  const phone = data.PhoneNumber || data.phone_number || '';
  const grade = data.GradeLevel || data.grade_level || '';
  const dob = data.DateOfBirth || data.date_of_birth || '';
  const status = data.EnrolmentStatus || data.EnrollmentStatus || data.enrollment_status || 'Active';

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Profile</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Your student account details.</p>

      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '2rem', maxWidth: '600px'
      }}>
        {/* Profile avatar and name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#065f46', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700
          }}>
            {firstName[0] || ''}{lastName[0] || ''}
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px', alignItems: 'center' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 600,
                backgroundColor: '#d1fae5', color: '#065f46'
              }}>Student</span>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        {/* Account details */}
        {fieldRow(<Mail size={16} color="#6b7280" />, 'Email', email)}
        {fieldRow(<Phone size={16} color="#6b7280" />, 'Phone', phone)}
        {fieldRow(<GraduationCap size={16} color="#6b7280" />, 'Grade Level', grade ? `Grade ${grade}` : null)}
        {fieldRow(<Calendar size={16} color="#6b7280" />, 'Date of Birth', dob ? new Date(dob).toLocaleDateString() : null)}
        {fieldRow(<User size={16} color="#6b7280" />, 'Student ID', userInfo?.id ? `#${userInfo.id}` : null)}
      </div>
    </div>
  );
}

export default StudentProfile;

import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AttendantDashboard from '@/components/dashboards/AttendantDashboard';
import SuperintendentDashboard from '@/components/dashboards/SuperintendentDashboard';
import SecurityDashboard from '@/components/dashboards/SecurityDashboard';

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <>
      {role === 'student' && <StudentDashboard />}
      {role === 'hostel_attendant' && <AttendantDashboard />}
      {role === 'superintendent' && <SuperintendentDashboard />}
      {role === 'security_guard' && <SecurityDashboard />}
    </>
  );
}

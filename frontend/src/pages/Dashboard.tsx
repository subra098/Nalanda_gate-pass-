import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import AttendantDashboard from '@/components/dashboards/AttendantDashboard';
import SuperintendentDashboard from '@/components/dashboards/SuperintendentDashboard';
import SecurityDashboard from '@/components/dashboards/SecurityDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-[220px] rounded-3xl bg-white p-6 text-center shadow-lg">
          <div className="mb-3 h-2 w-2/3 animate-pulse rounded-full bg-slate-200 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Preparing your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-[220px] rounded-3xl bg-white p-6 text-center shadow-lg">
          <div className="mb-3 h-2 w-2/3 animate-pulse rounded-full bg-slate-200 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Syncing your access…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === 'student' && <StudentDashboard />}
      {role === 'hostel_attendant' && <AttendantDashboard />}
      {role === 'superintendent' && <SuperintendentDashboard />}
      {role === 'security_guard' && <SecurityDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </>
  );
}

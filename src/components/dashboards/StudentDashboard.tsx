import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Clock, User } from 'lucide-react';
import Layout from '@/components/Layout';
import ApplyPassDialog from '@/components/student/ApplyPassDialog';
import PassCard from '@/components/student/PassCard';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchPasses();
    fetchProfile();
  }, [user]);

  const fetchPasses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPasses(data || []);
    } catch (error) {
      console.error('Error fetching passes:', error);
      toast.error('Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const stats = {
    total: passes.length,
    pending: passes.filter(p => p.status === 'pending').length,
    approved: passes.filter(p =>
      p.status === 'superintendent_approved' ||
      p.status === 'attendant_approved'
    ).length,
    active: passes.filter(p => p.status === 'exited').length,
  };

  // Chart data with vibrant education colors
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#2D9CDB' }, // Bright blue
    { name: 'Approved', value: stats.approved, color: '#27AE60' }, // Vibrant green
    { name: 'Active', value: stats.active, color: '#F2994A' }, // Warm orange
    { name: 'Rejected', value: passes.filter(p => p.status === 'rejected').length, color: '#EB5757' }, // Bright red
  ].filter(item => item.value > 0);

  // Monthly pass data
  const monthlyData = passes.reduce((acc: any[], pass) => {
    const month = new Date(pass.created_at).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []);

  const CHART_COLORS = {
    primary: '#1E40AF',      // Deep blue
    secondary: '#7C3AED',    // Purple
    gradient: 'url(#colorGradient)'
  };

  return (
    <Layout>
      <div className="space-y-6">
        {profile && showProfile && (
          <Card className="rounded-3xl border border-slate-100/70 bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900">My Profile</CardTitle>
              <CardDescription className="text-slate-500">Student information and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Full Name</p>
                  <p className="text-base font-semibold text-slate-900">{profile.full_name || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Roll Number</p>
                  <p className="text-base font-semibold text-slate-900">{profile.roll_no || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hostel</p>
                  <p className="text-base font-semibold text-slate-900">{profile.hostel || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Parent Contact</p>
                  <p className="text-base font-semibold text-slate-900">{profile.parent_contact || ''}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">College Email</p>
                  <p className="text-base font-semibold text-slate-900">{profile.college_email || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100/70 bg-white p-5 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProfile(!showProfile)}
              className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <User className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-slate-900">Student Dashboard</h2>
              <p className="text-sm text-slate-500">Manage your gatepass requests</p>
            </div>
          </div>
          <Button
            onClick={() => setShowApplyDialog(true)}
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Apply for Pass
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Passes</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Pending</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Approved</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Currently Out</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">Pass Status Distribution</CardTitle>
              <CardDescription className="text-sm text-slate-500">Overview of your pass statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D9CDB" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#56CCF2" stopOpacity={0.9}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#27AE60" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#6FCF97" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={85}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">Monthly Pass Requests</CardTitle>
              <CardDescription className="text-sm text-slate-500">Number of passes by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">My Passes</CardTitle>
            <CardDescription className="text-sm text-slate-500">View and manage your gatepass history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-sm text-slate-500">Loading passes...</div>
            ) : passes.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">
                No passes yet. Apply for your first pass!
              </div>
            ) : (
              <div className="space-y-4">
                {passes.map((pass) => (
                  <PassCard key={pass.id} pass={pass} onUpdate={fetchPasses} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ApplyPassDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        onSuccess={fetchPasses}
      />
    </Layout>
  );
}

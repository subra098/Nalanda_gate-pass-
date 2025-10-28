import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Clock } from 'lucide-react';
import Layout from '@/components/Layout';
import ApplyPassDialog from '@/components/student/ApplyPassDialog';
import PassCard from '@/components/student/PassCard';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    fetchPasses();
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Student Dashboard</h2>
            <p className="text-muted-foreground">Manage your gatepass requests</p>
          </div>
          <Button onClick={() => setShowApplyDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Apply for Pass
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.navy/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.navy">Total Passes</CardDescription>
              <CardTitle className="text-3xl text-education.navy font-bold">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.teal/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.teal">Pending</CardDescription>
              <CardTitle className="text-3xl text-education.teal font-bold">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.forest/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.forest">Approved</CardDescription>
              <CardTitle className="text-3xl text-education.forest font-bold">{stats.approved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.gold/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.gold">Currently Out</CardDescription>
              <CardTitle className="text-3xl text-education.gold font-bold">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Pass Status Distribution</CardTitle>
              <CardDescription>Overview of your pass statuses</CardDescription>
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

          <Card className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950 dark:to-cyan-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Monthly Pass Requests</CardTitle>
              <CardDescription>Number of passes by month</CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>My Passes</CardTitle>
            <CardDescription>View and manage your gatepass history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading passes...</div>
            ) : passes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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

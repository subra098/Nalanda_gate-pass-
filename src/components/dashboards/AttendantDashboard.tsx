import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Phone, User, FileText } from 'lucide-react';
import PassCard from '@/components/shared/PassCard';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AttendantDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [todaysApprovals, setTodaysApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [hostel, setHostel] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchHostelAndPasses();
    fetchTodaysApprovals();
    if (user) setProfile(user);
  }, [user]);

  const fetchHostelAndPasses = async () => {
    if (!user) return;

    try {
      // Fetch pending and attendant approved passes
      // Note: In real app, filter by hostel. Here we fetch all.
      const { data } = await api.get('/gatepass/list?status=PENDING,ATTENDANT_APPROVED');

      setPasses(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysApprovals = async () => {
    if (!user) return;
    try {
      // We lack a specific endpoint for this in migration plan, so we'll fetch list and filter client side
      // Fetch approved passes
      const { data } = await api.get('/gatepass/list?status=ATTENDANT_APPROVED,SUPERINTENDENT_APPROVED');

      setTodaysApprovals(data);

    } catch (error) {
      console.error('Error fetching today\'s approvals:', error);
    }
  };

  const handleApprove = async (pass: any) => {
    try {
      await api.put(`/gatepass/${pass.id}/status`, {
        status: 'APPROVED',
        notes: notes
      });

      toast.success('Pass approved! Forwarded.');
      setSelectedPass(null);
      setNotes('');
      fetchHostelAndPasses();
      fetchTodaysApprovals();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve pass');
    }
  };

  const handleReject = async (pass: any) => {
    try {
      await api.put(`/gatepass/${pass.id}/status`, {
        status: 'REJECTED',
        notes: notes
      });

      toast.success('Pass rejected');
      setSelectedPass(null);
      setNotes('');
      fetchHostelAndPasses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject pass');
    }
  };

  // Chart data with vibrant colors
  const statusChartData = [
    { name: 'Pending', value: passes.filter(p => p.status === 'pending').length, fill: '#F59E0B' },
    { name: 'Forwarded', value: passes.filter(p => p.status === 'attendant_approved').length, fill: '#10B981' },
  ].filter(item => item.value > 0);

  const destinationData = passes.reduce((acc: any[], pass) => {
    const dest = pass.destination_type || 'Unknown';
    const existing = acc.find(item => item.name === dest);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: dest, value: 1 });
    }
    return acc;
  }, []);

  /* Profile is now available in user context */

  const DESTINATION_COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#3B82F6', '#EF4444'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Attendant Dashboard</h2>
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-lg font-medium text-slate-900">Welcome, {user?.fullName}</p>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Assigned Hostel: {user?.hostel || 'Not Assigned'}
                </span>
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>

        {profile && showProfile && (
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-lg">{profile.full_name}</p>
              <p className="font-semibold text-lg">{profile.roll_no}</p>
              <p className="font-semibold text-lg">{profile.hostel}</p>
              <p className="font-semibold text-lg">{profile.parent_contact}</p>
              <p className="font-semibold text-lg">{profile.college_email}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.teal/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.teal">Pending Review</CardDescription>
              <CardTitle className="text-3xl text-education.teal font-bold">
                {passes.filter(p => p.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.forest/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.forest">Forwarded</CardDescription>
              <CardTitle className="text-3xl text-education.forest font-bold">
                {passes.filter(p => p.status === 'attendant_approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.navy/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.navy">Total Requests</CardDescription>
              <CardTitle className="text-3xl text-education.navy font-bold">{passes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.gold/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.gold">Today's Approvals</CardDescription>
              <CardTitle className="text-3xl text-education.gold font-bold">{todaysApprovals.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Pass Status Overview</CardTitle>
              <CardDescription>Current pass distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChartData}>
                  <defs>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="forwardedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Destination Types</CardTitle>
              <CardDescription>Pass requests by destination</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={destinationData}
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
                    {destinationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DESTINATION_COLORS[index % DESTINATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="approved">Today's Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pass Requests</CardTitle>
                <CardDescription>Review and process gatepass applications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : passes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passes.map((pass) => (
                      <PassCard key={pass.id} pass={pass} showActions={false}>
                        {pass.status === 'pending' && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(pass)}
                              className="bg-green-600 hover:bg-green-700 h-9"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(pass)}
                              className="h-9"
                            >
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPass(pass);
                                setNotes('');
                              }}
                              className="h-9"
                            >
                              <FileText className="h-4 w-4 mr-1.5" />
                              Add Notes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:${pass.profiles?.parent_contact}`)}
                              className="h-9"
                            >
                              <Phone className="h-4 w-4 mr-1.5" />
                              Call Parent
                            </Button>
                          </div>
                        )}
                      </PassCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Today's Approved Passes</CardTitle>
                <CardDescription>Passes approved by you today</CardDescription>
              </CardHeader>
              <CardContent>
                {todaysApprovals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No approvals today</div>
                ) : (
                  <div className="space-y-4">
                    {todaysApprovals.map((pass) => (
                      <PassCard key={pass.id} pass={pass} showActions={false} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedPass} onOpenChange={() => setSelectedPass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Pass Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Review this pass request. After approval, it will be forwarded to the superintendent.
              </p>
            </div>
            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={() => selectedPass && handleApprove(selectedPass)}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => selectedPass && handleReject(selectedPass)}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

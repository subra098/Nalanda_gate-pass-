import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LayoutDashboard, Users, FileText, CheckCircle, Clock, XCircle, User, ShieldCheck } from 'lucide-react';
import PassCard from '@/components/shared/PassCard';

export default function SuperintendentDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [todaysApprovals, setTodaysApprovals] = useState<any[]>([]);
  const [approvedPasses, setApprovedPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchData();
    fetchTodaysApprovals();
    fetchApprovedPasses();
    if (user) setProfile(user);
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch passes awaiting approval (Attendant Approved)
      const { data: passData } = await api.get('/gatepass/list?status=ATTENDANT_APPROVED');

      setPasses(passData || []);

      // Fetch extension requests - API not yet implemented for extensions, mock or skip for now
      // Assuming we need to add an endpoint for extensions later. 
      // For this migration, we will focus on core flow first.
      setExtensions([]);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysApprovals = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/gatepass/list?status=SUPERINTENDENT_APPROVED');

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todays = data.filter((p: any) =>
        p.superintendentId === user.id &&
        new Date(p.updatedAt) >= startOfDay
      );

      setTodaysApprovals(todays);
    } catch (error) {
      console.error('Error fetching today\'s approvals:', error);
      toast.error('Failed to load today\'s approvals');
    }
  };

  const fetchApprovedPasses = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/gatepass/list?status=SUPERINTENDENT_APPROVED');
      // Filter for last 7 days locally for now
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recent = data.filter((p: any) =>
        p.superintendentId === user.id &&
        new Date(p.createdAt) >= sevenDaysAgo
      ).map((pass: any) => ({
        ...pass,
        profiles: pass.student
      }));

      setApprovedPasses(recent);

    } catch (error) {
      console.error('Error fetching approved passes:', error);
      toast.error('Failed to load approved passes');
    }
  };

  const handleApprovePass = async (passId: string, notes: string = '') => {
    try {
      await api.put(`/gatepass/${passId}/status`, {
        status: 'APPROVED',
        notes
      });

      toast.success('Pass approved! QR code generated.');
      fetchData();
      fetchTodaysApprovals();
      fetchApprovedPasses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve pass');
    }
  };

  const handleRejectPass = async (passId: string, notes: string = '') => {
    try {
      await api.put(`/gatepass/${passId}/status`, {
        status: 'REJECTED',
        notes
      });

      toast.success('Pass rejected');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject pass');
    }
  };

  const handleApproveExtension = async (extId: string, gatepassId: string, newReturnAt: string) => {
    // API Implementation pending for extensions
    toast.error("Extension approval not yet migrated");
  };

  // Chart data - weekly approval trends
  const approvalData = approvedPasses.slice(0, 7).map((pass, index) => ({
    day: new Date(pass.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    passes: approvedPasses.filter(p =>
      new Date(p.createdAt).toDateString() === new Date(pass.createdAt).toDateString()
    ).length
  }));

  const hostelData = approvedPasses.reduce((acc: any[], pass) => {
    const hostel = pass.profiles?.hostel || 'Unknown';
    const existing = acc.find(item => item.name === hostel);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: hostel, value: 1 });
    }
    return acc;
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Superintendent Dashboard</h2>
            <p className="text-muted-foreground">Final approval and oversight</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowProfile(!showProfile)}
            className="ml-4"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>

        {showProfile && profile && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Superintendent Profile</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm font-semibold">{profile.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm font-semibold">{user?.email || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <p className="text-sm font-semibold">{profile.role || 'Superintendent'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hostel</label>
                  <p className="text-sm font-semibold">{profile.hostel || 'Not assigned'}</p>
                </div>
                {profile.contact_number && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                    <p className="text-sm font-semibold">{profile.contact_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.teal/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.teal">Pending Approval</CardDescription>
              <CardTitle className="text-3xl text-education.teal font-bold">{passes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.gold/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.gold">Extension Requests</CardDescription>
              <CardTitle className="text-3xl text-education.gold font-bold">{extensions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.navy/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.navy">Total</CardDescription>
              <CardTitle className="text-3xl text-education.navy font-bold">{passes.length + extensions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover-lift bg-white/95 backdrop-blur-sm border-education.forest/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-education.forest">Today's Approvals</CardDescription>
              <CardTitle className="text-3xl text-education.forest font-bold">{todaysApprovals.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Weekly Pass Trends</CardTitle>
              <CardDescription>Recent pass approval activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={approvalData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="passes"
                    stroke="#0EA5E9"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950 dark:to-lime-950">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">Passes by Hostel</CardTitle>
              <CardDescription>Distribution across hostels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hostelData}>
                  <defs>
                    <linearGradient id="hostelGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.8} />
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
                    fill="url(#hostelGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="passes">
          <TabsList>
            <TabsTrigger value="passes">Pass Requests</TabsTrigger>
            <TabsTrigger value="extensions">Time Extensions</TabsTrigger>
            <TabsTrigger value="approved">Today's Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="passes">
            <Card>
              <CardHeader>
                <CardTitle>Awaiting Final Approval</CardTitle>
              </CardHeader>
              <CardContent>
                {passes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending approvals</div>
                ) : (
                  <div className="space-y-4">
                    {passes.map((pass) => (
                      <PassCard key={pass.id} pass={pass} showActions={false}>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
                          <Button
                            size="sm"
                            onClick={() => handleApprovePass(pass.id)}
                            className="bg-green-600 hover:bg-green-700 h-9"
                          >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Approve & Generate QR
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectPass(pass.id)}
                            className="h-9"
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Reject
                          </Button>
                        </div>
                      </PassCard>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extensions">
            <Card>
              <CardHeader>
                <CardTitle>Extension Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {extensions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No extension requests</div>
                ) : (
                  <div className="space-y-4">
                    {extensions.map((ext: any) => (
                      <Card key={ext.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <p className="font-semibold">{ext.gatepasses?.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {ext.gatepasses?.profiles?.roll_no}
                            </p>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Reason:</strong> {ext.reason}</p>
                            <p><strong>Original Return:</strong> {new Date(ext.gatepasses?.expected_return_at).toLocaleString()}</p>
                            <p><strong>New Return Time:</strong> {new Date(ext.new_expected_return_at).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveExtension(ext.id, ext.gatepass_id, ext.new_expected_return_at)}
                            >
                              Approve Extension
                            </Button>
                            <Button size="sm" variant="destructive">
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
    </Layout>
  );
}

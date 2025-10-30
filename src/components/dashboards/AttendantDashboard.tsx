import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Phone, User } from 'lucide-react';
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
    fetchProfile();
  }, [user]);

  const fetchHostelAndPasses = async () => {
    if (!user) return;

    try {
      // Get attendant's hostel
      const { data: profile } = await supabase
        .from('profiles')
        .select('hostel')
        .eq('id', user.id)
        .single();

      if (profile?.hostel) {
        setHostel(profile.hostel);

        // Get all students from the same hostel
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id, full_name, roll_no, parent_contact, hostel')
          .eq('hostel', profile.hostel);

        if (studentsError) throw studentsError;

        const studentIds = students?.map(s => s.id) || [];

        if (studentIds.length > 0) {
          // Fetch passes for these students
          const { data: passesData, error: passesError } = await supabase
            .from('gatepasses')
            .select('*')
            .in('student_id', studentIds)
            .in('status', ['pending', 'attendant_approved'])
            .order('created_at', { ascending: false });

          if (passesError) throw passesError;

          // Manually join profiles with passes
          const passesWithProfiles = passesData?.map(pass => ({
            ...pass,
            profiles: students.find(s => s.id === pass.student_id)
          })) || [];

          setPasses(passesWithProfiles);
        } else {
          setPasses([]);
        }
      }
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
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch today's approved passes by this attendant
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('attendant_id', user.id)
        .in('status', ['attendant_approved', 'superintendent_approved'])
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (approvalsError) throw approvalsError;

      // Get student profiles for these passes
      if (approvalsData && approvalsData.length > 0) {
        const studentIds = approvalsData.map(p => p.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, roll_no, parent_contact, hostel')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Manually join profiles with passes
        const approvalsWithProfiles = approvalsData.map(pass => ({
          ...pass,
          profiles: profilesData?.find(p => p.id === pass.student_id)
        }));

        setTodaysApprovals(approvalsWithProfiles);
      } else {
        setTodaysApprovals([]);
      }
    } catch (error) {
      console.error('Error fetching today\'s approvals:', error);
      toast.error('Failed to load today\'s approvals');
    }
  };

  const handleApprove = async (pass: any) => {
    try {
      // Check if destination is chandaka - if yes, auto-approve and generate QR
      const isChandaka = pass.destination_type?.toLowerCase() === 'chandaka';
      
      let updateData: any = {
        attendant_id: user?.id,
        attendant_notes: notes
      };

      if (isChandaka) {
        // Auto-approve chandaka passes with QR code
        const qrData = JSON.stringify({
          passId: pass.id,
          timestamp: Date.now()
        });
        
        updateData.status = 'superintendent_approved';
        updateData.qr_code_data = qrData;
      } else {
        // Regular passes go to superintendent
        updateData.status = 'attendant_approved';
      }

      const { error } = await supabase
        .from('gatepasses')
        .update(updateData)
        .eq('id', pass.id);

      if (error) throw error;

      toast.success(
        isChandaka
          ? 'Chandaka pass approved! QR code generated.'
          : 'Pass approved! Forwarded to superintendent.'
      );
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
      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'rejected',
          attendant_id: user?.id,
          attendant_notes: notes
        })
        .eq('id', pass.id);

      if (error) throw error;

      toast.success('Pass rejected');
      setSelectedPass(null);
      setNotes('');
      fetchHostelAndPasses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject pass');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { label: 'Pending Review', variant: 'secondary' },
      attendant_approved: { label: 'Waiting for Superintendent', variant: 'default' },
    };
    return variants[status] || { label: status, variant: 'outline' };
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

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, roll_no, hostel, parent_contact, college_email')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const DESTINATION_COLORS = ['#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#3B82F6', '#EF4444'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Attendant Dashboard</h2>
            <p className="text-muted-foreground">Review and approve gatepass requests for {hostel}</p>
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
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="forwardedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.8}/>
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
                      <Card key={pass.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1">
                              <p className="font-semibold">{pass.profiles?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Roll No: {pass.profiles?.roll_no}
                              </p>
                            </div>
                            <Badge {...getStatusBadge(pass.status)}>{getStatusBadge(pass.status).label}</Badge>
                          </div>

                          <div className="space-y-2 text-sm mb-4">
                            <p><strong>Destination:</strong> {pass.destination_type} - {pass.destination_details}</p>
                            <p><strong>Reason:</strong> {pass.reason}</p>
                            <p><strong>Expected Return:</strong> {new Date(pass.expected_return_at).toLocaleString()}</p>
                            <p><strong>Parent Contact:</strong> {pass.profiles?.parent_contact}</p>
                          </div>

                          {pass.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPass(pass);
                                  setNotes('');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Call Parent
                              </Button>
                            </div>
                          )}
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
                      <Card key={pass.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{pass.profiles?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {pass.profiles?.roll_no} • {pass.profiles?.hostel}
                              </p>
                            </div>
                            <Badge variant="default">
                              {pass.status === 'superintendent_approved' ? 'Fully Approved' : 'Forwarded'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Destination:</strong> {pass.destination_type} - {pass.destination_details}</p>
                            <p><strong>Reason:</strong> {pass.reason}</p>
                            <p><strong>Expected Return:</strong> {new Date(pass.expected_return_at).toLocaleString()}</p>
                            <p><strong>Approved At:</strong> {new Date(pass.updated_at).toLocaleString()}</p>
                            {pass.attendant_notes && (
                              <p><strong>Your Notes:</strong> {pass.attendant_notes}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
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

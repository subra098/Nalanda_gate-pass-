import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function SuperintendentDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [extensions, setExtensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch passes awaiting approval
      const { data: passData, error: passError } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('status', 'attendant_approved')
        .order('created_at', { ascending: false });

      if (passError) throw passError;

      // Fetch profiles for these passes
      if (passData && passData.length > 0) {
        const studentIds = passData.map(p => p.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, roll_no, hostel, parent_contact')
          .in('id', studentIds);

        if (profilesError) throw profilesError;

        // Manually join
        const passesWithProfiles = passData.map(pass => ({
          ...pass,
          profiles: profilesData?.find(p => p.id === pass.student_id)
        }));

        setPasses(passesWithProfiles);
      } else {
        setPasses([]);
      }

      // Fetch extension requests
      const { data: extData, error: extError } = await supabase
        .from('extension_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (extError) throw extError;

      // Fetch associated gatepasses and profiles for extensions
      if (extData && extData.length > 0) {
        const gatepassIds = extData.map(e => e.gatepass_id);
        const { data: gatepassData, error: gatepassError } = await supabase
          .from('gatepasses')
          .select('*')
          .in('id', gatepassIds);

        if (gatepassError) throw gatepassError;

        const extStudentIds = gatepassData?.map(g => g.student_id) || [];
        const { data: extProfilesData, error: extProfilesError } = await supabase
          .from('profiles')
          .select('id, full_name, roll_no')
          .in('id', extStudentIds);

        if (extProfilesError) throw extProfilesError;

        // Manually join extensions with gatepasses and profiles
        const extensionsWithData = extData.map(ext => ({
          ...ext,
          gatepasses: {
            ...gatepassData?.find(g => g.id === ext.gatepass_id),
            profiles: extProfilesData?.find(p => p.id === gatepassData?.find(g => g.id === ext.gatepass_id)?.student_id)
          }
        }));

        setExtensions(extensionsWithData);
      } else {
        setExtensions([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePass = async (passId: string, notes: string = '') => {
    try {
      // Generate QR code data
      const qrData = JSON.stringify({
        passId,
        timestamp: Date.now()
      });

      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'superintendent_approved',
          superintendent_id: user?.id,
          superintendent_notes: notes,
          qr_code_data: qrData
        })
        .eq('id', passId);

      if (error) throw error;

      toast.success('Pass approved! QR code generated.');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve pass');
    }
  };

  const handleRejectPass = async (passId: string, notes: string = '') => {
    try {
      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'rejected',
          superintendent_id: user?.id,
          superintendent_notes: notes
        })
        .eq('id', passId);

      if (error) throw error;

      toast.success('Pass rejected');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reject pass');
    }
  };

  const handleApproveExtension = async (extId: string, gatepassId: string, newReturnAt: string) => {
    try {
      const { error: extError } = await supabase
        .from('extension_requests')
        .update({ status: 'approved' })
        .eq('id', extId);

      if (extError) throw extError;

      const { error: passError } = await supabase
        .from('gatepasses')
        .update({ expected_return_at: newReturnAt })
        .eq('id', gatepassId);

      if (passError) throw passError;

      toast.success('Extension approved');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to approve extension');
    }
  };

  // Chart data - weekly approval trends
  const approvalData = passes.slice(0, 7).map((pass, index) => ({
    day: new Date(pass.created_at).toLocaleDateString('en-US', { weekday: 'short' }),
    passes: passes.filter(p => 
      new Date(p.created_at).toDateString() === new Date(pass.created_at).toDateString()
    ).length
  }));

  const hostelData = passes.reduce((acc: any[], pass) => {
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
        <div>
          <h2 className="text-3xl font-bold">Superintendent Dashboard</h2>
          <p className="text-muted-foreground">Final approval and oversight</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Pass Trends</CardTitle>
              <CardDescription>Recent pass approval activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={approvalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="passes" stroke="hsl(var(--education-navy))" fill="hsl(var(--education-teal))" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passes by Hostel</CardTitle>
              <CardDescription>Distribution across hostels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hostelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--education-forest))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="passes">
          <TabsList>
            <TabsTrigger value="passes">Pass Requests</TabsTrigger>
            <TabsTrigger value="extensions">Time Extensions</TabsTrigger>
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
                      <Card key={pass.id}>
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-semibold">{pass.profiles?.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {pass.profiles?.roll_no} • {pass.profiles?.hostel}
                              </p>
                            </div>
                            <Badge>Pending</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p><strong>Destination:</strong> {pass.destination_type} - {pass.destination_details}</p>
                            <p><strong>Reason:</strong> {pass.reason}</p>
                            <p><strong>Expected Return:</strong> {new Date(pass.expected_return_at).toLocaleString()}</p>
                            {pass.attendant_notes && (
                              <p><strong>Attendant Notes:</strong> {pass.attendant_notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprovePass(pass.id)}>
                              Approve & Generate QR
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleRejectPass(pass.id)}>
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
        </Tabs>
      </div>
    </Layout>
  );
}

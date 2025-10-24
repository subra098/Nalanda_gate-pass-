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
        .select(`
          *,
          profiles!gatepasses_student_id_fkey(full_name, roll_no, hostel, parent_contact)
        `)
        .eq('status', 'attendant_approved')
        .order('created_at', { ascending: false });

      if (passError) throw passError;
      setPasses(passData || []);

      // Fetch extension requests
      const { data: extData, error: extError } = await supabase
        .from('extension_requests')
        .select(`
          *,
          gatepasses(
            *,
            profiles!gatepasses_student_id_fkey(full_name, roll_no)
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (extError) throw extError;
      setExtensions(extData || []);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Superintendent Dashboard</h2>
          <p className="text-muted-foreground">Final approval and oversight</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-3xl">{passes.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Extension Requests</CardDescription>
              <CardTitle className="text-3xl">{extensions.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{passes.length + extensions.length}</CardTitle>
            </CardHeader>
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

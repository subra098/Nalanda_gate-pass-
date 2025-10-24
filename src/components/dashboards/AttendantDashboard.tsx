import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Phone } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AttendantDashboard() {
  const { user } = useAuth();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [hostel, setHostel] = useState('');

  useEffect(() => {
    fetchHostelAndPasses();
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

  const handleApprove = async (pass: any) => {
    try {
      const { error } = await supabase
        .from('gatepasses')
        .update({
          status: 'attendant_approved',
          attendant_id: user?.id,
          attendant_notes: notes
        })
        .eq('id', pass.id);

      if (error) throw error;

      toast.success('Pass approved! Forwarded to superintendent.');
      setSelectedPass(null);
      setNotes('');
      fetchHostelAndPasses();
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Attendant Dashboard</h2>
          <p className="text-muted-foreground">Review and approve gatepass requests for {hostel}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">
                {passes.filter(p => p.status === 'pending').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Forwarded</CardDescription>
              <CardTitle className="text-3xl">
                {passes.filter(p => p.status === 'attendant_approved').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-3xl">{passes.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

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

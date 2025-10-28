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

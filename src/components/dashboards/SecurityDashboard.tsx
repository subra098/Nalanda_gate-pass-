import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScanLine, LogOut as ExitIcon, LogIn as EntryIcon } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import QRScanner from '@/components/security/QRScanner';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scannedPass, setScannedPass] = useState<any>(null);
  const [showPassDetails, setShowPassDetails] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Fetch gate logs
      const { data: logsData, error: logsError } = await supabase
        .from('gate_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Fetch associated gatepasses
      if (logsData && logsData.length > 0) {
        const gatepassIds = logsData.map(log => log.gatepass_id);
        const { data: gatepassesData, error: gatepassesError } = await supabase
          .from('gatepasses')
          .select('*')
          .in('id', gatepassIds);

        if (gatepassesError) throw gatepassesError;

        // Manually join
        const logsWithGatepasses = logsData.map(log => ({
          ...log,
          gatepasses: gatepassesData?.find(g => g.id === log.gatepass_id)
        }));

        setLogs(logsWithGatepasses);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      const { passId } = data;

      // Fetch the pass with student profile
      const { data: pass, error: passError } = await supabase
        .from('gatepasses')
        .select('*')
        .eq('id', passId)
        .single();

      if (passError || !pass) {
        toast.error('Invalid QR code');
        return;
      }

      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', pass.student_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Check if pass is approved
      if (pass.status !== 'superintendent_approved' && pass.status !== 'exited') {
        toast.error('Pass not approved');
        return;
      }

      // Check if pass has expired
      if (new Date(pass.expected_return_at) < new Date() && pass.status === 'exited') {
        toast.error('Pass expired! Alerting superintendent...');
        // TODO: Implement superintendent alert
        return;
      }

      // Determine action (exit or entry)
      const action = pass.status === 'superintendent_approved' ? 'exit' : 'entry';
      const newStatus = action === 'exit' ? 'exited' : 'entered';

      // Create log entry
      const { error: logError } = await supabase
        .from('gate_logs')
        .insert({
          gatepass_id: passId,
          security_guard_id: user?.id,
          action
        });

      if (logError) throw logError;

      // Update pass status
      const { error: updateError } = await supabase
        .from('gatepasses')
        .update({ status: newStatus })
        .eq('id', passId);

      if (updateError) throw updateError;

      // Show pass details
      setScannedPass({ ...pass, profile, action });
      setShowScanner(false);
      setShowPassDetails(true);
      toast.success(`${action === 'exit' ? 'Exit' : 'Entry'} recorded successfully`);
      fetchLogs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process scan');
    }
  };

  const getActionIcon = (action: string) => {
    return action === 'exit' ? <ExitIcon className="h-4 w-4" /> : <EntryIcon className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    return action === 'exit' ? (
      <Badge variant="destructive">Exit</Badge>
    ) : (
      <Badge className="bg-green-600">Entry</Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Security Dashboard</h2>
            <p className="text-muted-foreground">Scan and verify gatepasses</p>
          </div>
          <Button onClick={() => setShowScanner(true)} size="lg">
            <ScanLine className="h-5 w-5 mr-2" />
            Scan QR Code
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Scans Today</CardDescription>
              <CardTitle className="text-3xl">
                {logs.filter(l => 
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Exits Today</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {logs.filter(l => 
                  l.action === 'exit' && 
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Entries Today</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {logs.filter(l => 
                  l.action === 'entry' && 
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Entry and exit logs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No activity yet</div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded">
                        {getActionIcon(log.action)}
                      </div>
                      <div>
                        <p className="font-semibold">Pass ID: {log.gatepass_id?.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.action === 'exit' ? 'Student exited' : 'Student returned'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getActionBadge(log.action)}
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showScanner && (
        <QRScanner 
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showPassDetails && scannedPass && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pass Details</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowPassDetails(false)}
                >
                  <span className="sr-only">Close</span>
                  ×
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getActionBadge(scannedPass.action)}
                <Badge variant="outline">
                  {scannedPass.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{scannedPass.profile?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-semibold">{scannedPass.profile?.roll_no || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hostel</p>
                  <p className="font-semibold">{scannedPass.profile?.hostel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-semibold">{scannedPass.profile?.parent_contact || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Destination Type</p>
                  <p className="font-semibold capitalize">{scannedPass.destination_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination Details</p>
                  <p className="font-semibold">{scannedPass.destination_details}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-semibold">{scannedPass.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="font-semibold">
                    {new Date(scannedPass.expected_return_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <Button 
                onClick={() => setShowPassDetails(false)} 
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, LogOut as ExitIcon, LogIn as EntryIcon, Trash2, User } from 'lucide-react';
import Layout from '@/components/Layout';
import { toast } from 'sonner';
import QRScanner from '@/components/security/QRScanner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SecurityDashboard() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scannedPass, setScannedPass] = useState<any>(null);
  const [showPassDetails, setShowPassDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [profile, setProfile] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchLogs();
    if (user) setProfile(user);
  }, [user]);

  const fetchLogs = async () => {
    try {
      const { data: logsData } = await api.get('/security/logs');
      setLogs(logsData || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  // Profile now comes from user context

  const handleScan = async (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      const passId = data.passId;

      // Determine action type based on current pass status
      // For simplicity, let security guard  determine action/Type visually for now
      // Auto-detect: fetch pass first or send type from QR code

      await api.post('/security/scan', {
        gatepassId: passId,
        type: 'EXIT' // Default to exit, update UI to let user choose if needed
      });

      toast.success('Scan recorded successfully');
      setShowScanner(false);
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

  const handleDeleteLog = async (logId: string) => {
    toast.error('Delete functionality not yet migrated');
  };

  // Filter logs based on active tab
  const filteredLogs = activeTab === 'all' ? logs : logs.filter(log => log.destination_type === activeTab);

  // Chart data - hourly activity
  const hourlyData = filteredLogs.reduce((acc: any[], log) => {
    const hour = new Date(log.timestamp).getHours();
    const hourLabel = `${hour}:00`;
    const existing = acc.find(item => item.hour === hourLabel);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ hour: hourLabel, count: 1 });
    }
    return acc;
  }, []).slice(0, 12);

  // Exit vs Entry data with vibrant colors
  const activityData = [
    { name: 'Exits', value: filteredLogs.filter(l => l.action === 'exit').length, color: '#DC2626' },
    { name: 'Entries', value: filteredLogs.filter(l => l.action === 'entry').length, color: '#059669' },
  ].filter(item => item.value > 0);

  return (
    <Layout>
      <div className="space-y-6">
        {profile && showProfile && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-education.navy/20">
            <CardHeader>
              <CardTitle className="text-education-navy dark:text-white">My Profile</CardTitle>
              <CardDescription>Security guard information and details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-lg">{profile.full_name || ''}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">College Email</p>
                  <p className="font-semibold text-lg">{profile.college_email || ''}</p>
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
              <h2 className="text-2xl font-semibold text-slate-900">Security Dashboard</h2>
              <p className="text-sm text-slate-500">Scan and verify gatepasses</p>
            </div>
          </div>
          <Button
            onClick={() => setShowScanner(true)}
            size="lg"
            className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <ScanLine className="h-5 w-5 mr-2" />
            Scan QR Code
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Scans Today</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {filteredLogs.filter(l =>
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Exits Today</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {filteredLogs.filter(l =>
                  l.action === 'exit' &&
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide text-slate-500">Entries Today</CardDescription>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {filteredLogs.filter(l =>
                  l.action === 'entry' &&
                  new Date(l.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">Hourly Gate Activity</CardTitle>
              <CardDescription className="text-sm text-slate-500">Entry and exit patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourlyData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="hour" stroke="#374151" />
                  <YAxis stroke="#374151" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#lineGradient)"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold text-slate-900">Activity Distribution</CardTitle>
              <CardDescription className="text-sm text-slate-500">Exits vs entries comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    <linearGradient id="exitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.9} />
                    </linearGradient>
                    <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={activityData}
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
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-full bg-slate-100 p-1 text-sm font-medium">
            <TabsTrigger value="all" className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900">All</TabsTrigger>
            <TabsTrigger value="chandaka" className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900">Chandaka</TabsTrigger>
            <TabsTrigger value="bhubaneswar" className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900">Bhubaneswar</TabsTrigger>
            <TabsTrigger value="home_other" className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900">Home/Other</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
                <CardDescription className="text-sm text-slate-500">Entry and exit logs</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="py-10 text-center text-sm text-slate-500">Loading...</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="py-10 text-center text-sm text-slate-500">No activity yet</div>
                ) : (
                  <div className="space-y-3">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-700">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pass ID</p>
                            <p className="text-base font-semibold text-slate-900 break-all">{log.gatepass_id}</p>
                            <div className="flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-3">
                              <span className="font-medium text-slate-900">{log.profiles?.full_name || 'Unknown student'}</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                                Reg. No: {log.profiles?.roll_no || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {log.action === 'exit' ? 'Student exited' : 'Student returned'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end gap-3 sm:items-center">
                          <div className="text-right">
                            {getActionBadge(log.action)}
                            <p className="mt-2 text-xs text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLog(log.id)}
                            className="rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showPassDetails && scannedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
          <Card className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white shadow-2xl">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">Pass Details</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">{scannedPass.id}</p>
                </div>
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
            <CardContent className="space-y-6 p-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Student Details</h3>
                <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Student Name</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.profiles?.full_name || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Registration Number</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.profiles?.roll_no || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hostel</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.profiles?.hostel || ''}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contact Number</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.profiles?.parent_contact || ''}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Pass Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Destination Type</p>
                    <p className="text-base font-semibold capitalize text-slate-900">{scannedPass.destination_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Destination Details</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.destination_details}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reason</p>
                    <p className="text-base font-semibold text-slate-900">{scannedPass.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Expected Return</p>
                    <p className="text-base font-semibold text-slate-900">
                      {new Date(scannedPass.expected_return_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowPassDetails(false)}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
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

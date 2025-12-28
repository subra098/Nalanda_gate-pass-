import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogOut, UserPlus, Shield, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
    const { user, signOut } = useAuth();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('');
    const [hostel, setHostel] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await api.get('/admin/staff');
            setStaffList(data);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            toast.error('Failed to load staff list');
        }
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (role === 'hostel_attendant' && !hostel) {
            toast.error('Hostel Name is required for Attendants');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email,
                password,
                fullName,
                role: role.toUpperCase(),
                hostel: role === 'hostel_attendant' ? hostel : undefined
            };

            await api.post('/admin/staff', payload);

            toast.success('Staff member created successfully');
            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('');
            setHostel('');

            fetchStaff(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                    <p className="text-slate-500">Manage system access and staff roles</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                        <p className="text-xs text-slate-500">System Administrator</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={signOut}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <div className="grid gap-8 md:grid-cols-12">
                {/* Create Staff Form */}
                <div className="md:col-span-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Add New Staff
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Create accounts for Hostel Attendants, Superintendents, or Security.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreateStaff} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. John Doe" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="staff@nit.edu" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Set initial password" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={role} onValueChange={setRole} required>
                                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hostel_attendant">Hostel Attendant</SelectItem>
                                            <SelectItem value="superintendent">Superintendent</SelectItem>
                                            <SelectItem value="security_guard">Security Guard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {role === 'hostel_attendant' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <Label htmlFor="hostel">Assigned Hostel</Label>
                                        <Input id="hostel" value={hostel} onChange={(e) => setHostel(e.target.value)} required placeholder="e.g. Block A" />
                                    </div>
                                )}

                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Staff List */}
                <div className="md:col-span-8">
                    <Card className="border-slate-200 shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Existing Staff
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border border-slate-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Role</th>
                                            <th className="p-4">Hostel</th>
                                            <th className="p-4">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {staffList.map((staff: any) => (
                                            <tr key={staff.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-medium text-slate-900">
                                                    {staff.fullName}
                                                    <div className="text-xs text-slate-500 font-normal">{staff.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${staff.role === 'HOSTEL_ATTENDANT' ? 'bg-blue-100 text-blue-800' :
                                                            staff.role === 'SUPERINTENDENT' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-amber-100 text-amber-800'}`}>
                                                        {staff.role.replace('_', ' ').toLowerCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-500">{staff.hostel || '-'}</td>
                                                <td className="p-4 text-slate-500">{format(new Date(staff.createdAt), 'MMM d, yyyy')}</td>
                                            </tr>
                                        ))}
                                        {staffList.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-slate-500">No staff accounts found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

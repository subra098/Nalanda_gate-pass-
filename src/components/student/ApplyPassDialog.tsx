import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ApplyPassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ApplyPassDialog({ open, onOpenChange, onSuccess }: ApplyPassDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destinationType: 'chandaka' as 'chandaka' | 'bhubaneswar' | 'home_other',
    destinationDetails: '',
    reason: '',
    expectedReturnAt: '',
    // Home-specific fields
    roomNo: '',
    branch: '',
    semester: '',
    section: '',
    fromDate: '',
    destinationAddress: '',
    meansOfTravel: '',
    localGuardianName: '',
    localGuardianContact: '',
    parentName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const payload = {
        destinationType: formData.destinationType,
        destinationDetails: formData.destinationDetails,
        reason: formData.reason,
        expectedReturnAt: formData.expectedReturnAt,
        ...(formData.destinationType === 'home_other' ? {
          roomNo: formData.roomNo,
          branch: formData.branch,
          semester: formData.semester,
          section: formData.section,
          fromDate: formData.fromDate,
          destinationAddress: formData.destinationAddress,
          meansOfTravel: formData.meansOfTravel,
          localGuardianName: formData.localGuardianName,
          localGuardianContact: formData.localGuardianContact,
          parentName: formData.parentName,
        } : {})
      };

      await api.post('/gatepass/request', payload);

      toast.success('Pass application submitted successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        destinationType: 'chandaka',
        destinationDetails: '',
        reason: '',
        expectedReturnAt: '',
        roomNo: '',
        branch: '',
        semester: '',
        section: '',
        fromDate: '',
        destinationAddress: '',
        meansOfTravel: '',
        localGuardianName: '',
        localGuardianContact: '',
        parentName: '',
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {formData.destinationType === 'home_other' ? 'Leave Application' : 'Apply for Gatepass'}
          </DialogTitle>
          {formData.destinationType === 'home_other' && (
            <p className="text-sm text-slate-500 italic">By boarders seeking permission to remain absent from the Hostel</p>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="destination-type" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Destination Type</Label>
              <Select
                value={formData.destinationType}
                onValueChange={(v: any) => setFormData({ ...formData, destinationType: v })}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="chandaka">Chandaka</SelectItem>
                  <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                  <SelectItem value="home_other">Home (Leave Application)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.destinationType === 'home_other' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="room-no" className="text-xs font-semibold">Room No</Label>
                  <Input id="room-no" value={formData.roomNo} onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })} required className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch" className="text-xs font-semibold">Branch</Label>
                  <Input id="branch" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} required className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester" className="text-xs font-semibold">Semester</Label>
                  <Input id="semester" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} required className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-xs font-semibold">Section</Label>
                  <Input id="section" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} required className="h-10 rounded-lg" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="reason" className="text-xs font-semibold">Purpose of Leaving</Label>
                  <Textarea id="reason" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required className="rounded-lg resize-none h-20" placeholder="State the reason clearly..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from-date" className="text-xs font-semibold">Date & Time of Leaving</Label>
                  <Input id="from-date" type="datetime-local" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} required className="h-10 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return-time" className="text-xs font-semibold">Expected Return Date & Time</Label>
                  <Input id="return-time" type="datetime-local" value={formData.expectedReturnAt} onChange={(e) => setFormData({ ...formData, expectedReturnAt: e.target.value })} required className="h-10 rounded-lg" />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="dest-addr" className="text-xs font-semibold">Destination Address (during leave)</Label>
                  <Textarea id="dest-addr" value={formData.destinationAddress} onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })} required className="rounded-lg h-20" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel" className="text-xs font-semibold">Means of Travel</Label>
                  <Select value={formData.meansOfTravel} onValueChange={(v) => setFormData({ ...formData, meansOfTravel: v })}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Select means" /></SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="own_vehicle">Own Vehicle</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent-name" className="text-xs font-semibold">Parent Name</Label>
                  <Input id="parent-name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} required className="h-10 rounded-lg" />
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700">Local Guardian Details (if any)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lg-name" className="text-xs font-semibold">Guardian Name</Label>
                      <Input id="lg-name" value={formData.localGuardianName} onChange={(e) => setFormData({ ...formData, localGuardianName: e.target.value })} className="h-10 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lg-contact" className="text-xs font-semibold">Guardian Contact</Label>
                      <Input id="lg-contact" value={formData.localGuardianContact} onChange={(e) => setFormData({ ...formData, localGuardianContact: e.target.value })} className="h-10 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="destination-details" className="text-xs font-semibold">Destination Details</Label>
                  <Input
                    id="destination-details"
                    value={formData.destinationDetails}
                    onChange={(e) => setFormData({ ...formData, destinationDetails: e.target.value })}
                    placeholder="Specific location or address"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs font-semibold">Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for outing"
                    required
                    className="rounded-xl h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-time" className="text-xs font-semibold">Expected Return Date & Time</Label>
                  <Input
                    id="return-time"
                    type="datetime-local"
                    value={formData.expectedReturnAt}
                    onChange={(e) => setFormData({ ...formData, expectedReturnAt: e.target.value })}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-xl border-slate-200 text-slate-600 px-6 hover:bg-slate-50 transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

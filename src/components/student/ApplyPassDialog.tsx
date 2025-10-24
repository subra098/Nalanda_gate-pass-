import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
    expectedReturnAt: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('gatepasses')
        .insert({
          student_id: user.id,
          destination_type: formData.destinationType,
          destination_details: formData.destinationDetails,
          reason: formData.reason,
          expected_return_at: formData.expectedReturnAt,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Pass application submitted successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        destinationType: 'chandaka',
        destinationDetails: '',
        reason: '',
        expectedReturnAt: ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Gatepass</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination-type">Destination Type</Label>
            <Select 
              value={formData.destinationType} 
              onValueChange={(v: any) => setFormData({...formData, destinationType: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chandaka">Chandaka</SelectItem>
                <SelectItem value="bhubaneswar">Bhubaneswar</SelectItem>
                <SelectItem value="home_other">Home/Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination-details">Destination Details</Label>
            <Input
              id="destination-details"
              value={formData.destinationDetails}
              onChange={(e) => setFormData({...formData, destinationDetails: e.target.value})}
              placeholder="Specific location or address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Reason for outing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="return-time">Expected Return Date & Time</Label>
            <Input
              id="return-time"
              type="datetime-local"
              value={formData.expectedReturnAt}
              onChange={(e) => setFormData({...formData, expectedReturnAt: e.target.value})}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

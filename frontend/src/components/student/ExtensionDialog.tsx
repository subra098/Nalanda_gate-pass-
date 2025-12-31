import { useState } from 'react';
import api from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ExtensionDialogProps {
  passId: string;
  passType: 'chandaka' | 'bhubaneswar' | 'home';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExtensionDialog({ passId, passType, onClose, onSuccess }: ExtensionDialogProps) {
  const [reason, setReason] = useState('');
  const [newReturnAt, setNewReturnAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/extension/request', {
        passId,
        passType,
        reason,
        newExpectedReturnAt: newReturnAt,
      });

      toast.success('Extension request submitted');
      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit extension request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Extension</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need more time"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-return">New Expected Return Time</Label>
            <Input
              id="new-return"
              type="datetime-local"
              value={newReturnAt}
              onChange={(e) => setNewReturnAt(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

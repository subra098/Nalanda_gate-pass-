import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ExtensionDialogProps {
  passId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExtensionDialog({ passId, onClose, onSuccess }: ExtensionDialogProps) {
  const [reason, setReason] = useState('');
  const [newReturnAt, setNewReturnAt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('extension_requests')
        .insert({
          gatepass_id: passId,
          reason,
          new_expected_return_at: newReturnAt,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Extension request submitted');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit extension request');
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

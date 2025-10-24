import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Clock, MapPin } from 'lucide-react';
import QRCodeDisplay from '@/components/student/QRCodeDisplay';
import ExtensionDialog from '@/components/student/ExtensionDialog';

interface PassCardProps {
  pass: any;
  onUpdate: () => void;
}

export default function PassCard({ pass, onUpdate }: PassCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [showExtension, setShowExtension] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      pending: { label: 'Pending', variant: 'secondary' },
      attendant_approved: { label: 'Attendant Approved', variant: 'default' },
      superintendent_approved: { label: 'Approved', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      exited: { label: 'Currently Out', variant: 'default' },
      entered: { label: 'Returned', variant: 'outline' },
      overdue: { label: 'Overdue', variant: 'destructive' }
    };
    return badges[status] || { label: status, variant: 'outline' };
  };

  const canShowQR = ['superintendent_approved', 'exited'].includes(pass.status);
  const canRequestExtension = pass.status === 'exited' && 
    new Date(pass.expected_return_at) < new Date();

  const statusBadge = getStatusBadge(pass.status);

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold capitalize">
                  {pass.destination_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{pass.destination_details}</p>
            </div>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <p><strong>Reason:</strong> {pass.reason}</p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <strong>Expected Return:</strong> {new Date(pass.expected_return_at).toLocaleString()}
            </p>
            <p><strong>Applied:</strong> {new Date(pass.created_at).toLocaleString()}</p>
          </div>

          {pass.attendant_notes && (
            <div className="bg-muted p-3 rounded text-sm mb-4">
              <p className="font-semibold mb-1">Attendant Notes:</p>
              <p>{pass.attendant_notes}</p>
            </div>
          )}

          {pass.superintendent_notes && (
            <div className="bg-muted p-3 rounded text-sm mb-4">
              <p className="font-semibold mb-1">Superintendent Notes:</p>
              <p>{pass.superintendent_notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            {canShowQR && (
              <Button size="sm" onClick={() => setShowQR(true)}>
                <QrCode className="h-4 w-4 mr-2" />
                View QR Code
              </Button>
            )}
            {canRequestExtension && (
              <Button size="sm" variant="outline" onClick={() => setShowExtension(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Request Extension
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showQR && pass.qr_code_data && (
        <QRCodeDisplay 
          qrData={pass.qr_code_data}
          pass={pass}
          onClose={() => setShowQR(false)}
        />
      )}

      {showExtension && (
        <ExtensionDialog
          passId={pass.id}
          onClose={() => setShowExtension(false)}
          onSuccess={() => {
            setShowExtension(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

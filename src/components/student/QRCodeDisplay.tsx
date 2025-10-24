import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  qrData: string;
  pass: any;
  onClose: () => void;
}

export default function QRCodeDisplay({ qrData, pass, onClose }: QRCodeDisplayProps) {
  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `gatepass-${pass.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Your Gatepass QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG 
              id="qr-code"
              value={qrData} 
              size={256}
              level="H"
              includeMargin
            />
          </div>
          <div className="text-sm text-center space-y-2">
            <p className="font-semibold">Destination: {pass.destination_details}</p>
            <p className="text-muted-foreground">
              Valid until: {new Date(pass.expected_return_at).toLocaleString()}
            </p>
          </div>
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

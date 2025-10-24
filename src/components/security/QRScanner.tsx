import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScanning = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No camera found');
          return;
        }

        if (videoRef.current) {
          codeReader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, err) => {
              if (result) {
                onScan(result.getText());
              }
            }
          );
        }
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError('Failed to access camera');
      }
    };

    startScanning();

    return () => {
      codeReader.reset();
    };
  }, [onScan]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 border-4 border-primary/50 m-12"></div>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground">
            Position the QR code within the frame
          </div>
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const startContinuousScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        
        const codeReader = new BrowserMultiFormatReader();
        codeReaderRef.current = codeReader;
        
        setIsScanning(true);
        
        // Start continuous scanning
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result, error) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            toast.success('QR Code scanned successfully!');
            onScan(result.getText());
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error('Scan error:', error);
          }
        });
      } catch (err) {
        console.error('Error starting camera:', err);
        setError('Failed to access camera');
        setIsScanning(false);
      }
    };

    startContinuousScanning();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
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
            {isScanning ? 'Scanning... Position the QR code within the frame' : 'Initializing camera...'}
          </div>
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

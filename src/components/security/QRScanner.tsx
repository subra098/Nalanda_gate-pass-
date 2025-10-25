import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ScanLine } from 'lucide-react';
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

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        
        codeReaderRef.current = new BrowserMultiFormatReader();
      } catch (err) {
        console.error('Error starting camera:', err);
        setError('Failed to access camera');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const handleScanClick = async () => {
    if (!codeReaderRef.current || !videoRef.current || isScanning) return;
    
    setIsScanning(true);
    try {
      const result = await codeReaderRef.current.decodeFromVideoElement(videoRef.current);
      if (result) {
        onScan(result.getText());
      }
    } catch (err) {
      console.error('Error scanning:', err);
      toast.error('No QR code detected. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

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
            Position the QR code within the frame and click Scan
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleScanClick} 
              disabled={isScanning || !!error}
              className="w-full"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan QR Code'}
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

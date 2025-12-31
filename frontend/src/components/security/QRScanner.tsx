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
  const [manualId, setManualId] = useState('');
  const [view, setView] = useState<'camera' | 'manual'>('camera');
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
      } catch (err: any) {
        console.error('Error starting camera:', err);
        if (!window.isSecureContext) {
          setError('SECURITY ERROR: Camera access is blocked because this site is not using HTTPS. Browsers only allow camera use on localhost or secure domains.');
        } else {
          setError('Camera Error: Please ensure you have granted camera permissions.');
        }
        setIsScanning(false);
      }
    };

    if (view === 'camera') {
      startContinuousScanning();
    }

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
          <div className="space-y-4">
            <div className="flex rounded-lg bg-slate-100 p-1">
              <Button
                variant={view === 'camera' ? 'ghost' : 'ghost'}
                className={`flex-1 rounded-md text-sm font-medium transition-all ${view === 'camera' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                onClick={() => setView('camera')}
              >
                Camera
              </Button>
              <Button
                variant={view === 'manual' ? 'ghost' : 'ghost'}
                className={`flex-1 rounded-md text-sm font-medium transition-all ${view === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                onClick={() => setView('manual')}
              >
                Manual Entry
              </Button>
            </div>

            {view === 'camera' ? (
              <>
                {error ? (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-medium text-destructive mb-2">Security Restriction</p>
                    <p className="text-xs text-slate-500 mb-4">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => setView('manual')}>
                      Use Manual Entry Instead
                    </Button>
                  </div>
                ) : (
                  <div className="relative aspect-square bg-black rounded-2xl overflow-hidden shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    <div className="absolute inset-0 border-2 border-primary/30 m-16 rounded-lg pointer-events-none">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-sm"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-sm"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-sm"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-sm"></div>
                    </div>
                  </div>
                )}
                <div className="text-center text-sm text-muted-foreground py-2">
                  {isScanning ? 'Scanning... Center the QR code' : 'Initializing camera...'}
                </div>
              </>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Pass ID</label>
                  <input
                    type="text"
                    placeholder="Paste or type Pass ID here..."
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && manualId) {
                        onScan(JSON.stringify({ passId: manualId }));
                      }
                    }}
                  />
                </div>
                <Button
                  disabled={!manualId}
                  className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold shadow-lg shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50"
                  onClick={() => onScan(JSON.stringify({ passId: manualId }))}
                >
                  Verify Pass ID
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={onClose} className="flex-1 h-11 rounded-xl text-slate-500 hover:bg-slate-100">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

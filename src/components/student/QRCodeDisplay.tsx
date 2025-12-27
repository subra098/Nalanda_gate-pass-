import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle, Clock, MapPin, Shield, User } from 'lucide-react';
import { useEffect } from 'react';

interface QRCodeDisplayProps {
  qrData?: string | null;
  pass: any;
  onClose: () => void;
}

export default function QRCodeDisplay({ qrData, pass, onClose }: QRCodeDisplayProps) {
  // CRITICAL SAFETY CHECK
  if (!pass || !pass.id) {
    console.error('QR_CRITICAL: Pass data is missing or invalid');
    return null;
  }

  useEffect(() => {
    console.log('QR_DEBUG_REV_5: Mounted', {
      id: pass.id,
      hasData: !!qrData,
      status: pass.status
    });
  }, [qrData, pass]);

  const handleDownload = () => {
    try {
      const svg = document.getElementById('qr-code-svg');
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
        downloadLink.download = `gatepass-${pass.id.substring(0, 8)}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const isOldFormat = typeof qrData === 'string' && qrData.startsWith('data:image');

  // Safe Date string
  const getSafeDate = () => {
    try {
      if (!pass.expected_return_at) return 'Not set';
      const date = new Date(pass.expected_return_at);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (e) {
      return 'Format error';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl">
        <div className="bg-indigo-600 p-6 text-white pb-12">
          <div className="flex justify-between items-center mb-4">
            <Shield className="h-6 w-6 opacity-80" />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Digital Gatepass REV_5</span>
          </div>
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-2xl font-bold text-white leading-tight">Your Digital Pass</DialogTitle>
            <div className="flex items-center gap-2 text-indigo-100 text-sm opacity-90">
              <Clock className="h-3 w-3" />
              <span>Scan this at the main gate</span>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 -mt-8 pb-8">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 flex flex-col items-center">
            <div className="relative group p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
              {qrData ? (
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrData}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-48 h-48 py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase">Wait for Approval</p>
                  <p className="text-[9px] text-slate-400 mt-1">QR will appear once fully approved</p>
                </div>
              )}

              {isOldFormat && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-[9px] font-bold rounded-full shadow-lg">
                  LEGACY SYSTEM
                </div>
              )}
            </div>

            <div className="mt-8 w-full space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Student</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {pass.profiles?.full_name || 'N/A'}
                    <span className="ml-2 text-[10px] text-muted-foreground">({pass.profiles?.roll_no || 'N/A'})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Destination</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{pass.destination_details || pass.destination_type || 'Leave'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Return Time</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{getSafeDate()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleDownload}
              disabled={!qrData}
              className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Save Image
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400"
            >
              Close
            </Button>
          </div>

          <p className="text-[10px] text-center text-slate-400 mt-6 font-mono opacity-50">UID: {pass.id}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

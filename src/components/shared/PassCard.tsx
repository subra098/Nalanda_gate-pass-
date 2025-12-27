import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Clock, MapPin, FileText, ShieldCheck } from 'lucide-react';
import QRCodeDisplay from '@/components/student/QRCodeDisplay';
import ExtensionDialog from '@/components/student/ExtensionDialog';

interface PassCardProps {
    pass: any;
    onUpdate?: () => void;
    children?: React.ReactNode;
    showActions?: boolean;
}

export default function PassCard({ pass, onUpdate, children, showActions = true }: PassCardProps) {
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
            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-xl text-slate-900 dark:text-slate-100">
                                    {pass.profiles?.full_name || 'Student'}
                                </span>
                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                                    {pass.profiles?.roll_no || 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <MapPin className="h-4 w-4" />
                                <span className="font-bold capitalize text-sm">
                                    {pass.destination_type?.replace('_', ' ') || 'Unknown'}
                                </span>
                            </div>
                        </div>
                        <Badge className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" variant={statusBadge.variant}>
                            {statusBadge.label}
                        </Badge>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for Leave</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{pass.reason}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination Details</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pass.destination_details || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hostel</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pass.profiles?.hostel || 'N/A'}</p>
                            </div>

                            {pass.destination_type === 'home_online' || pass.destination_type === 'home_other' ? (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Info</p>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            {pass.branch} ({pass.semester} sem, Sec {pass.section})
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room No</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pass.room_no || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Travel Means</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{pass.means_of_travel || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guardian/Parent</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{pass.parent_name || pass.local_guardian_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leave Duration</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-indigo-500" />
                                            {new Date(pass.from_date).toLocaleDateString()} - {new Date(pass.expected_return_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1 text-indigo-600 dark:text-indigo-400">
                                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Parent Contact</p>
                                        <a href={`tel:${pass.profiles?.parent_contact}`} className="text-sm font-bold hover:underline flex items-center gap-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                            {pass.profiles?.parent_contact || 'N/A'}
                                        </a>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Return</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                                            {(() => {
                                                try {
                                                    return pass.expected_return_at ? new Date(pass.expected_return_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
                                                } catch (e) { return 'Invalid Date'; }
                                            })()}
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1 col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Application Time</p>
                                <p className="text-xs font-medium text-slate-500">
                                    {(() => {
                                        try {
                                            return pass.created_at ? new Date(pass.created_at).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }) : 'N/A';
                                        } catch (e) { return 'Invalid Date'; }
                                    })()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {pass.attendant_notes && (
                            <div className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3.5 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1 inline-flex items-center gap-1.5">
                                    <FileText className="h-3 w-3" /> Attendant Notes
                                </p>
                                <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed italic">"{pass.attendant_notes}"</p>
                            </div>
                        )}

                        {pass.superintendent_notes && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 inline-flex items-center gap-1.5">
                                    <ShieldCheck className="h-3 w-3" /> Superintendent Remarks
                                </p>
                                <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-relaxed italic">"{pass.superintendent_notes}"</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {showActions && (
                            <>
                                {canShowQR && (
                                    <Button size="sm" onClick={() => setShowQR(true)} className="bg-indigo-600 hover:bg-indigo-700">
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
                            </>
                        )}
                        {children}
                    </div>
                </CardContent>
            </Card>

            {showQR && (
                <QRCodeDisplay
                    qrData={pass.qr_code_data}
                    pass={pass}
                    onClose={() => setShowQR(false)}
                />
            )}

            {showExtension && onUpdate && (
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





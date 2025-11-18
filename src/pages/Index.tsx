import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';

import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <motion.main
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <img
            src="/nalanda-logo.png"
            alt="Nalanda University Logo"
            className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm"
          />
          <div className="space-y-2">
            <motion.span
              className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Smart hostel access
            </motion.span>
            <motion.h1
              className="text-3xl font-semibold text-slate-900"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              Digital Gatepass System
            </motion.h1>
            <motion.p
              className="text-base leading-relaxed text-slate-600"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.35 }}
            >
              Manage exit requests, approvals, and QR-based check-ins in one sleek, mobile-friendly workspace.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="space-y-3 text-left text-sm text-slate-500">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <p>Instant QR generation for superintendent approvals.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <p>Role-based dashboards designed for students and staff.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <p>Live activity tracking for security checkpoints.</p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="w-full bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Get Started
          </Button>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Index;

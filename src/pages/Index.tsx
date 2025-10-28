import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';

import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-academic">
      <motion.div
        className="text-center space-y-6 p-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", bounce: 0.4 }}
        >
          <Shield className="h-20 w-20 mx-auto text-white glow-purple bounce-gentle" />
        </motion.div>
        <motion.h1
          className="text-5xl font-bold text-gradient"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Digital Gatepass System
        </motion.h1>
        <motion.p
          className="text-xl text-white/90 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Secure and efficient hostel exit management with role-based access control
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="hover-glow-purple bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-6 p-8">
        <Shield className="h-20 w-20 mx-auto text-primary" />
        <h1 className="text-5xl font-bold">Digital Gatepass System</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Secure and efficient hostel exit management with role-based access control
        </p>
        <Button size="lg" onClick={() => navigate('/auth')}>
          <LogIn className="h-5 w-5 mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;

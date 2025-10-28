import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-authority">
      <header className="border-b bg-white/10 backdrop-blur-sm border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-white glow-purple" />
            <div>
              <h1 className="text-xl font-bold text-white">Digital Gatepass</h1>
              {role && (
                <p className="text-sm text-white/80 capitalize">
                  {role.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white hover:bg-white/20 hover-glow-teal"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

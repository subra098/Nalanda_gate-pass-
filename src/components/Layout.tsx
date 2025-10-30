import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Digital Gatepass</h1>
              {role && (
                <p className="text-sm text-gray-600 capitalize">
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
              className="text-gray-700 hover:bg-gray-100"
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

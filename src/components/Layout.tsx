import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, role, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/nalanda-logo.png"
              alt="Nalanda University Logo"
              className="h-10 w-10 rounded-xl border border-gray-200 object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nalanda Digital Gatepass</h1>
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

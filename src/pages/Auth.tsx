import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

type UserRole = 'student' | 'hostel_attendant' | 'superintendent' | 'security_guard';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [rollNo, setRollNo] = useState('');
  const [hostel, setHostel] = useState('');
  const [parentContact, setParentContact] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const additionalData = role === 'student' ? {
          rollNo: rollNo,
          hostel,
          parentContact: parentContact,
        } : role === 'hostel_attendant' ? {
          hostel
        } : {};

        await signUp(email, password, fullName, role, additionalData);
      }
      // Navigation is handled by useEffect when user is set
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="rounded-3xl border border-slate-100/60 bg-white p-6 shadow-2xl sm:p-8">
          <CardHeader className="space-y-4 p-0 pb-4 text-center">
            <motion.div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Shield className="h-6 w-6" />
            </motion.div>
            <div className="space-y-2">
              <motion.span
                className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                Seamless hostel access
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="space-y-1"
              >
                <CardTitle className="text-3xl font-semibold text-slate-900">Welcome back</CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Sign in or create an account to manage gatepass workflows on the go.
                </CardDescription>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-0">
            <Tabs
              value={isLogin ? 'login' : 'register'}
              onValueChange={(v) => setIsLogin(v === 'login')}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
                <TabsTrigger
                  value="login"
                  className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-full py-2 text-slate-500 transition data-[state=active]:bg-white data-[state=active]:text-slate-900"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="rollNo" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Roll Number
                    </Label>
                    <Input
                      id="rollNo"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hostel" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Hostel
                    </Label>
                    <Input
                      id="hostel"
                      value={hostel}
                      onChange={(e) => setHostel(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="parentContact" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Parent's Contact
                    </Label>
                    <Input
                      id="parentContact"
                      type="tel"
                      value={parentContact}
                      onChange={(e) => setParentContact(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-email" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Password
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm shadow-sm focus:border-slate-400 focus:ring-slate-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';

type UserRole = 'student' | 'hostel_attendant' | 'superintendent' | 'security_guard' | 'admin';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  hostel?: string | null;
  rollNo?: string | null;
  parentContact?: string | null;
  collegeEmail?: string | null;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      // Convert role from uppercase (backend) to lowercase (frontend)
      const userWithLowerRole = {
        ...data,
        role: data.role.toLowerCase()
      };
      setUser(userWithLowerRole);
      setRole(userWithLowerRole.role);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      const userWithLowerRole = { ...data.user, role: data.user.role.toLowerCase() };
      setUser(userWithLowerRole);
      setRole(userWithLowerRole.role);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login detail error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || "Login failed - Check console for details");
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    additionalData?: any
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        fullName,
        role,
        ...additionalData
      });
      localStorage.setItem("token", data.token);
      const userWithLowerRole = { ...data.user, role: data.user.role.toLowerCase() };
      setUser(userWithLowerRole);
      setRole(userWithLowerRole.role);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Registration detail error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      toast.error(error.response?.data?.message || "Registration failed - Check console for details");
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    navigate('/auth');
    toast.success('Signed out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

'use client';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

export type UserRole = 'user' | 'host' | 'admin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  token: string;
  userRole: UserRole;
  setUserId: (userId: string) => void;
  login: (role: Exclude<UserRole, null>, token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [token, setToken] = useState('');

  const setUserId = (userId: string) => {
    Cookies.set('userId', userId);
  };
  const login = (
    role: Exclude<UserRole, null>,
    token: string,
    userId: string
  ) => {
    setToken(token);
    Cookies.set('token', token, { expires: 7 }); // expires after 7 days
    Cookies.set('userId', userId, { expires: 7 });
    setUserRole(role);
    Cookies.set('userRole', role, { expires: 7 });
    setIsAuthenticated(true);
  };
  useEffect(() => {
    const tokenFromCookies = Cookies.get('token');
    const roleFromCookies = Cookies.get('userRole') as UserRole;

    if (tokenFromCookies) {
      setIsAuthenticated(true);
      setToken(tokenFromCookies);
      setUserRole(roleFromCookies);
    }
  }, []);

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('userId');
    Cookies.remove('userRole');
    setUserRole(null);
    setIsAuthenticated(false);
    setToken('');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        token,
        login,
        logout,
        setUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

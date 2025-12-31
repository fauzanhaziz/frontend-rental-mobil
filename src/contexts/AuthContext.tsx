'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

// 1. Definisikan Tipe Data User
interface User {
  username: string;
  email: string;
  role: 'admin' | 'customer';
  id_pelanggan?: number;
  nama_pelanggan?: string;
}

// 2. Definisikan Tipe Data Isi Token JWT (Supaya tidak pakai 'any')
interface CustomJwtPayload {
  username: string;
  email: string;
  role: 'admin' | 'customer';
  id_pelanggan?: number;
  nama_pelanggan?: string;
  exp?: number; // Expiration time
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, refresh: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 3. Pindahkan LOGOUT ke atas dan pakai useCallback
  // Ini solusi untuk error "missing dependency"
  const logout = useCallback(() => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    router.push('/login');
  }, [router]);

  // 4. useEffect sekarang aman karena logout sudah didefinisikan sebelumnya
  useEffect(() => {
    const token = Cookies.get('access_token');
    
    if (token) {
      try {
        // Gunakan Tipe Data CustomJwtPayload di sini
        const decoded = jwtDecode<CustomJwtPayload>(token);

        // Cek apakah token sudah expired? (Opsional tapi bagus)
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          throw new Error("Token expired");
        }

        setUser({
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          id_pelanggan: decoded.id_pelanggan,
          nama_pelanggan: decoded.nama_pelanggan,
        });
      } catch (error) {
        console.error("Token invalid atau expired", error);
        logout(); // Logout otomatis jika token rusak
      }
    }
    setLoading(false);
  }, [logout]); // Dependency array sudah lengkap

  const login = (accessToken: string, refreshToken: string) => {
    Cookies.set('access_token', accessToken, { expires: 1 });
    Cookies.set('refresh_token', refreshToken, { expires: 7 });

    const decoded = jwtDecode<CustomJwtPayload>(accessToken);
    
    const userData: User = {
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      id_pelanggan: decoded.id_pelanggan,
      nama_pelanggan: decoded.nama_pelanggan,
    };
    
    setUser(userData);

    if (userData.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/customer/dashboard');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
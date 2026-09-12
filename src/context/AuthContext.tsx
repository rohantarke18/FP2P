import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdminOrOfficer: boolean;
  isSuperAdmin: boolean;
  isDeptAdmin: boolean;
  isOfficer: boolean;
  isExpert: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: {
    name?: string;
    phone?: string;
    avatar?: string;
    wardOrDistrict?: string;
    language?: string;
  }) => Promise<void>;
  provisionOfficialUser: (
    targetUserId: string,
    newRole: UserRole,
    departmentId?: string,
    designation?: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check current session from HTTP-only cookie on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser({
            ...data.user,
            id: data.user.id,
            uid: data.user.id,
            wardOrDistrict: data.user.ward_or_district || data.user.wardOrDistrict || 'Ward 8 (CIDCO / Kranti Chowk)',
          });
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.warn('Session verification check notice:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim(), password: pass }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid email or password.');
    }

    const verifiedUser: User = {
      ...data.user,
      id: data.user.id,
      uid: data.user.id,
      wardOrDistrict: data.user.ward_or_district || 'Ward 8 (CIDCO / Kranti Chowk)',
    };
    setUser(verifiedUser);
    return verifiedUser;
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    phone?: string
  ): Promise<User> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim(), password: pass, name: name.trim(), phone: phone?.trim() }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    const verifiedUser: User = {
      ...data.user,
      id: data.user.id,
      uid: data.user.id,
      wardOrDistrict: 'Ward 8 (CIDCO / Kranti Chowk)',
    };
    setUser(verifiedUser);
    return verifiedUser;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    setUser(null);
  };

  const updateUserProfile = async (updates: {
    name?: string;
    phone?: string;
    avatar?: string;
    wardOrDistrict?: string;
    language?: string;
  }) => {
    if (!user) return;

    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (res.ok && data.user) {
      setUser({
        ...user,
        ...data.user,
        id: data.user.id,
        uid: data.user.id,
      });
    }
  };

  const provisionOfficialUser = async (
    targetUserId: string,
    newRole: UserRole,
    departmentId?: string,
    designation?: string
  ) => {
    const res = await fetch('/api/admin/users/role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        targetUserId,
        newRole,
        departmentId,
        designation,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to provision official role.');
    }
  };

  const role: UserRole = user?.role || 'citizen';
  const isAuthenticated = !!user;
  const isSuperAdmin = role === 'super_admin';
  const isDeptAdmin = role === 'department_admin' || isSuperAdmin;
  const isOfficer = role === 'officer' || isDeptAdmin;
  const isExpert = role === 'expert' || isSuperAdmin;
  const isAdminOrOfficer = isOfficer || isExpert;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdminOrOfficer,
        isSuperAdmin,
        isDeptAdmin,
        isOfficer,
        isExpert,
        loading,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserProfile,
        provisionOfficialUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

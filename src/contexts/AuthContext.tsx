import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { app } from '../../utils/firebaseConfig';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: User['role']) => Promise<boolean>;
  signup: (email: string, password: string, role: User['role'], name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticating: boolean;
  isLoggingOut: boolean;
  getCurrentRole: () => User['role'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize user state from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('userRole');

    if (storedUser && storedRole) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Ensure the role from localStorage is applied
        parsedUser.role = storedRole as User['role'];
        setUser(parsedUser);
        console.log('User state recovered from localStorage:', parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Get role from localStorage or default to customer
        const storedRole = localStorage.getItem('userRole') as User['role'];
        const role = storedRole || 'customer';

        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        };

        // Ensure role is stored in localStorage
        localStorage.setItem('userRole', role);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        console.log('User state updated:', userData);
      } else {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        console.log('User logged out, state cleared');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: User['role']): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      // Store role before authentication to ensure it's available in onAuthStateChanged
      localStorage.setItem('userRole', role);
      console.log('Role stored before login:', role);

      await signInWithEmailAndPassword(auth, email, password);

      // Verify role was properly stored
      const storedRole = localStorage.getItem('userRole');
      console.log('Role verification after login:', storedRole);

      toast.success('Successfully signed in!');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      // Clear role on login failure
      localStorage.removeItem('userRole');

      let errorMessage = 'Failed to sign in. Please try again.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }

      toast.error(errorMessage);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signup = async (email: string, password: string, role: User['role'], name: string): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      // Store role before authentication to ensure it's available in onAuthStateChanged
      localStorage.setItem('userRole', role);
      console.log('Role stored before signup:', role);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Verify role was properly stored
      const storedRole = localStorage.getItem('userRole');
      console.log('Role verification after signup:', storedRole);

      toast.success('Account created successfully! Welcome!');
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      // Clear role on signup failure
      localStorage.removeItem('userRole');

      let errorMessage = 'Failed to create account. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
      }

      toast.error(errorMessage);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);
    try {
      // Show loading toast
      const loadingToast = toast.loading('Signing out...', {
        duration: 2000,
      });

      await signOut(auth);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Successfully signed out!', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);

      // Show error toast
      toast.error('Failed to sign out. Please try again.', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getCurrentRole = (): User['role'] | null => {
    return user?.role || localStorage.getItem('userRole') as User['role'] || null;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, isAuthenticating, isLoggingOut, getCurrentRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
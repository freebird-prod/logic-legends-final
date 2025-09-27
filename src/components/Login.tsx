import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Mail, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

type UserRole = 'admin' | 'caller' | 'email_team' | 'customer';

interface RoleOption {
  value: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const [isSignup, setIsSignup] = useState(false);
  const { login, signup, isAuthenticating } = useAuth();
  const navigate = useNavigate();

  const roleOptions: RoleOption[] = useMemo(() => [
    { value: 'admin', label: 'Admin Dashboard', icon: Shield, desc: 'Full system access and analytics' },
    { value: 'caller', label: 'Call Center', icon: Phone, desc: 'Handle priority calls and escalations' },
    { value: 'email_team', label: 'Email Team', icon: Mail, desc: 'Manage email communications' },
    { value: 'customer', label: 'Customer Portal', icon: User, desc: 'Submit and track support requests' },
  ], []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup) {
      const success = await signup(email, password, role, fullName);
      if (success) {
        console.log('Signup successful, navigating for role:', role);
        // Longer delay to ensure auth state has fully propagated
        setTimeout(() => {
          navigateBasedOnRole(role);
        }, 500);
      }
      return;
    }

    const success = await login(email, password, role);
    console.log('Login attempt result:', success, 'for role:', role);
    if (success) {
      // Longer delay to ensure auth state has fully propagated
      setTimeout(() => {
        navigateBasedOnRole(role);
      }, 500);
    }
  };

  const navigateBasedOnRole = (userRole: UserRole) => {
    console.log('Navigating based on role:', userRole);
    switch (userRole) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'caller':
        navigate('/priority-calls');
        break;
      case 'email_team':
        navigate('/templates');
        break;
      case 'customer':
        navigate('/');
        break;
      default:
        console.warn('Unknown role, defaulting to dashboard:', userRole);
        navigate('/dashboard');
    }
  };

  const getEmailPlaceholder = (selectedRole: UserRole): string => {
    const placeholders: Record<UserRole, string> = {
      admin: 'admin@company.in',
      caller: 'caller@company.in',
      email_team: 'email@company.in',
      customer: 'customer@company.in'
    };
    return placeholders[selectedRole];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-6">
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-2xl" style={{ minHeight: '500px', maxHeight: '90vh' }}>
        {/* Left Section - Preview */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt="Preview"
            className="absolute inset-0 h-full w-full object-cover rounded-l-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-l-2xl"></div>
          <div className="relative z-10 flex flex-col justify-end p-8 text-white">
            <h1 className="text-2xl font-bold">Capturing Moments, Creating Memories</h1>
            <p className="text-base text-gray-400 mt-2">Powered by Advanced AI Support System</p>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="transition-all duration-500 ease-in-out">
              <h2 className="text-xl lg:text-3xl font-bold mb-6 text-gray-900 text-center">
                {isSignup ? 'Create your account' : 'Sign in to your account'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name - Only for Signup */}
                {isSignup && (
                  <div className="transform transition-all duration-300 ease-in-out animate-fadeIn">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                    />
                  </div>
                )}

                {/* Role Selection */}
                <div className="transform transition-all duration-300 ease-in-out">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Select Your Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none transition-all duration-200"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.desc}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    {(() => {
                      const selectedOption = roleOptions.find(opt => opt.value === role);
                      if (selectedOption) {
                        const Icon = selectedOption.icon;
                        return (
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-purple-600" />
                            <div>
                              <span className="font-medium text-gray-900">{selectedOption.label}</span>
                              <p className="text-xs text-gray-600 mt-1">{selectedOption.desc}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Email */}
                <div className="transform transition-all duration-300 ease-in-out">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isSignup ? 'Enter your email' : getEmailPlaceholder(role)}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>

                {/* Password */}
                <div className="transform transition-all duration-300 ease-in-out">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full mt-1 px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAuthenticating && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                  {isAuthenticating ?
                    (isSignup ? 'Creating Account...' : 'Signing in...') :
                    (isSignup ? 'Create Account' : 'Sign In')
                  }
                </button>
              </form>

              <p className="text-sm text-gray-600 mt-4 text-center">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <span
                  className="text-purple-600 font-semibold cursor-pointer hover:underline transition-all duration-200"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setEmail('');
                    setPassword('');
                    setFullName('');
                  }}
                >
                  {isSignup ? 'Sign in' : 'Sign up'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#fff',
          color: '#000',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }
      }} />
    </div>
  );
};

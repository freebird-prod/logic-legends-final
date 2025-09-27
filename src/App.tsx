import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { ChatInterface } from './components/Chatbot/ChatInterface';

//@ts-ignore
import { TicketList } from './components/TicketManagement/TicketList';
import { WasteAnalytics } from './components/Analytics/WasteAnalytics';
import { ProactiveAlerts } from './components/ProactiveAlerts/ProactiveAlerts';
import { CustomerPortal } from './components/Customer/CustomerPortal';
import { EnhancedAnalytics } from './components/Analytics/EnhancedAnalytics';
import { TeamManagement } from './components/TeamManagement/TeamManagement';
import { EmailTemplates } from './components/EmailTemplates/EmailTemplates';
import { PriorityCalls } from './components/PriorityCalls/PriorityCalls';
import { Escalations } from './components/Escalations/Escalations';
import {
  Home,
  MessageCircle,
  Phone,
  Mail,
  BarChart3,
  Settings,
  Library,
  Bot,
  AlertTriangle,
  TrendingUp,
  Users,
  LogOut
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { mockTickets } from './data/mockTickets';
import { Ticket } from './types';
import { TicketService } from './services/ticketService';

// Protected Route Component with Role-Based Default Redirection
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For root path, redirect admin users specifically to dashboard
  if (location.pathname === '/' && user.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Navigation Sidebar Component
const NavigationSidebar: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();

  const getNavItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
      { id: 'library', label: 'Ticket Library', icon: Library, path: '/library' },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
        { id: 'chatbot', label: 'AI Chatbot', icon: Bot, path: '/chatbot' },
        { id: 'waste-analytics', label: 'Waste Analytics', icon: TrendingUp, path: '/waste-analytics' },
        { id: 'proactive-alerts', label: 'Proactive Alerts', icon: AlertTriangle, path: '/proactive-alerts' },
        { id: 'team-management', label: 'Team Management', icon: Users, path: '/team-management' },
        ...commonItems.slice(1),
      ];
    }

    if (user?.role === 'caller') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'priority-calls', label: 'Priority Calls', icon: Phone, path: '/priority-calls' },
        { id: 'escalations', label: 'Escalations', icon: AlertTriangle, path: '/escalations' },
        ...commonItems.slice(1),
      ];
    }

    if (user?.role === 'email_team') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'email-queue', label: 'Email Queue', icon: Mail, path: '/email-queue' },
        { id: 'moderate-tickets', label: 'Moderate Tickets', icon: MessageCircle, path: '/moderate-tickets' },
        { id: 'templates', label: 'Templates', icon: Settings, path: '/templates' },
        ...commonItems.slice(1),
      ];
    }

    return commonItems;
  };

  return (
    <div className="hidden lg:flex lg:w-1/4 xl:w-1/5 select-none relative overflow-hidden bg-white border-r border-gray-200">
      {/* Navigation Content */}
      <div className="relative flex flex-col h-full w-full">
        {/* Logo/Brand */}
        <div className="p-4 flex items-center border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Flip Kare AI</h1>
              <p className="text-xs text-gray-600 capitalize">{user?.role?.replace('_', ' ')} Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {getNavItems().map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-2.5 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-2 space-x-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-medium text-white">
              {(user?.name?.charAt(0)?.toUpperCase()) || (user?.email?.charAt(0)?.toUpperCase()) || 'U'}
            </div>
            <div className="flex-col items-center justify-center">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-600 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            disabled={isLoggingOut}
            className="w-full text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Signing Out...</span>
              </>
            ) : (
              <div className='px-2 py-1 bg-red-600 flex items-center gap-2.5 hover:bg-red-500 text-white rounded-xl w-full justify-center '>
                <LogOut className="w-4 h-4" />
                <span className='font-medium text-base'>Sign Out</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Role-Based Route Component with Enhanced Access Control
const RoleBasedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/dashboard' }) => {
  const { user, isLoading } = useAuth();

  // Show loading while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to specified route if user doesn't have required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, logout, isLoggingOut } = useAuth();
  const [tickets, setTickets] = useState(mockTickets);
  const [hasSeededData, setHasSeededData] = useState(false);

  // Seed mock data to Firestore on first load
  useEffect(() => {
    const seedMockData = async () => {
      if (hasSeededData) return;

      try {
        // Try to seed mock tickets to Firestore
        // We'll use a flag in localStorage to avoid seeding multiple times
        const seededFlag = localStorage.getItem('mockDataSeeded');
        if (!seededFlag) {
          console.log('Seeding mock tickets to Firestore...');
          for (const ticket of mockTickets) {
            try {
              await TicketService.seedTicket(ticket);
              console.log(`Seeded ticket: ${ticket.title}`);
            } catch (error) {
              console.error(`Error seeding ticket ${ticket.title}:`, error);
            }
          }
          localStorage.setItem('mockDataSeeded', 'true');
          console.log('Mock tickets seeding completed');
        }
        setHasSeededData(true);
      } catch (error) {
        console.error('Error in seeding process:', error);
        setHasSeededData(true); // Don't retry on error
      }
    };

    seedMockData();
  }, [hasSeededData]);

  const handleSubmitTicket = async (newTicket: Ticket) => {
    try {
      // Save to Firestore first
      const ticketId = await TicketService.createTicket(newTicket);
      const ticketWithId = { ...newTicket, id: ticketId };

      // Add the ticket to local state for immediate UI updates
      setTickets(prev => [ticketWithId, ...prev]);

      // Simulate real-time notification to teams
      console.log('New ticket submitted:', ticketWithId);

      // Auto-route based on priority
      if (newTicket.priority === 'priority') {
        console.log('Priority ticket routed to Call Team');
      } else if (newTicket.priority === 'moderate') {
        console.log('Moderate ticket routed to Email Team');
      } else {
        console.log('Normal ticket routed to AI Chatbot');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Still add to local state even if Firestore fails, for better UX
      setTickets(prev => [newTicket, ...prev]);
    }
  };

  // Customer Portal Layout
  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <Users className='p-1 rounded-lg bg-slate-400 w-9 h-9' />
              Customer Support Portal
            </h1>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span>Signing Out...</span>
                </>
              ) : (
                <div className='py-2 px-3 bg-red-500 rounded-xl text-white hover:scale-105 transition-all duration-300'>
                  <span>Sign Out</span>
                </div>
              )}
            </button>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<CustomerPortal onSubmitTicket={handleSubmitTicket} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Main App Layout for authenticated users
  return (
    <div className="flex h-screen">
      {/* Left Side - Navigation */}
      <NavigationSidebar />

      {/* Right Side - Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI Support</h1>
                <p className="text-sm text-gray-600 capitalize">{user?.role?.replace('_', ' ')} Portal</p>
              </div>
            </div>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="text-gray-600 hover:text-gray-900 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Routes>
              {/* Root route - direct access to dashboard */}
              <Route path="/" element={<DashboardOverview />} />

              {/* Dashboard - accessible to all authenticated users */}
              <Route path="/dashboard" element={<DashboardOverview />} />

              {/* Admin-Only Routes - Full access to all system features */}
              <Route path="/analytics" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <EnhancedAnalytics />
                </RoleBasedRoute>
              } />
              <Route path="/chatbot" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">AI Chatbot Interface</h2>
                    <ChatInterface />
                  </div>
                </RoleBasedRoute>
              } />
              <Route path="/waste-analytics" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <WasteAnalytics />
                </RoleBasedRoute>
              } />
              <Route path="/proactive-alerts" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <ProactiveAlerts />
                </RoleBasedRoute>
              } />
              <Route path="/team-management" element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <TeamManagement />
                </RoleBasedRoute>
              } />

              {/* Caller-Only Routes - Call team specific features */}
              <Route path="/priority-calls" element={
                <RoleBasedRoute allowedRoles={['caller']}>
                  <PriorityCalls />
                </RoleBasedRoute>
              } />
              <Route path="/escalations" element={
                <RoleBasedRoute allowedRoles={['caller']}>
                  <Escalations />
                </RoleBasedRoute>
              } />

              {/* Email Team-Only Routes - Email team specific features */}
              <Route path="/templates" element={
                <RoleBasedRoute allowedRoles={['email_team']}>
                  <EmailTemplates />
                </RoleBasedRoute>
              } />

              {/* Common Routes - Accessible to all authenticated non-customer users */}
              <Route path="/library" element={<TicketList title="Ticket Library" tickets={tickets} />} />

              {/* Fallback - redirect to dashboard for any unmatched routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
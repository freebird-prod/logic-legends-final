import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const getNavItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'library', label: 'Ticket Library', icon: Library },
      { id: 'settings', label: 'Settings', icon: Settings },
    ];

    if (user?.role === 'admin') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'tickets', label: 'All Tickets', icon: MessageCircle },
        { id: 'calls', label: 'Call Management', icon: Phone },
        { id: 'emails', label: 'Email Queue', icon: Mail },
        { id: 'chatbot', label: 'AI Chatbot', icon: Bot },
        { id: 'waste-reduction', label: 'Waste Analytics', icon: TrendingUp },
        { id: 'proactive', label: 'Proactive Alerts', icon: AlertTriangle },
        { id: 'team', label: 'Team Management', icon: Users },
        ...commonItems.slice(1),
      ];
    }

    if (user?.role === 'caller') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'priority-calls', label: 'Priority Calls', icon: Phone },
        { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
        { id: 'chatbot', label: 'AI Assistant', icon: Bot },
        ...commonItems.slice(1),
      ];
    }

    if (user?.role === 'email_team') {
      return [
        ...commonItems.slice(0, 1),
        { id: 'email-queue', label: 'Email Queue', icon: Mail },
        { id: 'moderate-tickets', label: 'Moderate Tickets', icon: MessageCircle },
        { id: 'templates', label: 'Email Templates', icon: Library },
        ...commonItems.slice(1),
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      ></div>

      {/* Header Section */}
      <div className="relative z-10 p-4 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="h-8 w-8 text-blue-400" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">AI Support</h1>
            <div
              className="relative"
              onMouseEnter={() => setShowLogout(true)}
              onMouseLeave={() => setShowLogout(false)}
            >
              {/* <p className="text-xs text-gray-400 capitalize cursor-pointer">
                {user?.role?.replace('_', ' ')} Portal
              </p> */}
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="absolute top-0 left-0 right-0 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <IconComponent className="h-5 w-5flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Section (Optional) */}
      <div className="relative z-10 p-4 border-t border-gray-800 flex-shrink-0">
        <div className="text-xs text-gray-500 text-center">
          AI Support System v2.0
        </div>
      </div>
    </nav>
  );
};
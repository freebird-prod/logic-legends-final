import React from 'react';
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
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

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

    // Customer role is handled in App.tsx, so this shouldn't be reached
    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gray-900 text-white w-64 min-h-screen flex flex-col relative overflow-y-auto">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
      ></div>
      <div className="relative z-10 p-4">
        <div className="flex items-center space-x-3 mb-6">
          <Bot className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">AI Support</h1>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')} Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
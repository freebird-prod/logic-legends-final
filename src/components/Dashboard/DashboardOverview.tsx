import React from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { TicketChart } from './TicketChart';
import { PriorityDistribution } from './PriorityDistribution';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();

  const getMetrics = () => {
    if (user?.role === 'admin') {
      return [
        { title: 'Total Tickets', value: '2,847', change: '+12% from last week', changeType: 'positive' as const, icon: MessageCircle, color: 'blue' as const },
        { title: 'Priority Calls', value: '34', change: '-8% from yesterday', changeType: 'positive' as const, icon: Phone, color: 'red' as const },
        { title: 'Email Queue', value: '156', change: '+5% from last hour', changeType: 'neutral' as const, icon: Mail, color: 'orange' as const },
        { title: 'Resolution Rate', value: '94.2%', change: '+2.1% improvement', changeType: 'positive' as const, icon: CheckCircle, color: 'green' as const },
        { title: 'Avg Response Time', value: '2.3 min', change: '-15 sec faster', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
        { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.2 from last month', changeType: 'positive' as const, icon: TrendingUp, color: 'green' as const },
        { title: 'Active Agents', value: '23', change: '5 on break', changeType: 'neutral' as const, icon: Users, color: 'blue' as const },
        { title: 'Waste Reduction', value: '$12.5K', change: 'Saved this month', changeType: 'positive' as const, icon: TrendingUp, color: 'green' as const },
      ];
    }

    if (user?.role === 'caller') {
      return [
        { title: 'Priority Calls Today', value: '8', change: '3 pending', changeType: 'neutral' as const, icon: Phone, color: 'red' as const },
        { title: 'Escalations Handled', value: '12', change: '+2 from yesterday', changeType: 'neutral' as const, icon: AlertTriangle, color: 'orange' as const },
        { title: 'Avg Call Duration', value: '4.2 min', change: '-30 sec shorter', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
        { title: 'Resolution Rate', value: '91%', change: '+3% improvement', changeType: 'positive' as const, icon: CheckCircle, color: 'green' as const },
      ];
    }

    if (user?.role === 'email_team') {
      return [
        { title: 'Emails Sent Today', value: '47', change: '+8 from yesterday', changeType: 'positive' as const, icon: Mail, color: 'blue' as const },
        { title: 'Moderate Tickets', value: '23', change: '12 in queue', changeType: 'neutral' as const, icon: MessageCircle, color: 'orange' as const },
        { title: 'Avg Response Time', value: '1.8 min', change: '-22 sec faster', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
        { title: 'Email Success Rate', value: '98.5%', change: 'Delivery rate', changeType: 'positive' as const, icon: CheckCircle, color: 'green' as const },
      ];
    }

    return [];
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 bg-white"
        ></div>
        <div className="relative z-10 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-lg opacity-90">
            Here's what's happening with your support system today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ticket Volume Trend
              </h3>
              <TicketChart />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Priority Distribution
              </h3>
              <PriorityDistribution />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Activity Feed
            </h3>
            <div className="space-y-3">
              {[
                { type: 'priority', message: 'High priority ticket #2847 assigned to Call Team', time: '2 min ago', color: 'red' },
                { type: 'moderate', message: 'Moderate ticket #2846 routed to Email Team', time: '5 min ago', color: 'orange' },
                { type: 'resolved', message: 'Ticket #2845 resolved by AI Chatbot', time: '8 min ago', color: 'green' },
                { type: 'escalation', message: 'Customer sentiment detected as frustrated - escalated', time: '12 min ago', color: 'purple' },
                { type: 'proactive', message: 'Proactive alert sent for server maintenance', time: '15 min ago', color: 'blue' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`h-2 w-2 rounded-full bg-${activity.color}-500`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
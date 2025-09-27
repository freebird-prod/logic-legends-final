import React, { useState, useEffect } from 'react';
import {
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
import { TicketService } from '../../services/ticketService';
import { Ticket } from '../../types';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    // Set up real-time listener for tickets
    const unsubscribe = TicketService.listenToTickets((allTickets) => {
      setTickets(allTickets);
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  const getMetrics = () => {
    const totalTickets = tickets.length;
    const priorityCount = tickets.filter(t => t.priority === 'priority').length;
    const normalCount = tickets.filter(t => t.priority === 'normal').length;
    const today = new Date().toDateString();
    const priorityToday = tickets.filter(t => t.priority === 'priority' && new Date(t.createdAt).toDateString() === today).length;

    if (user?.role === 'admin') {
      return [
        { title: 'Total Tickets', value: totalTickets.toString(), change: '+12% from last week', changeType: 'positive' as const, icon: Users, color: 'blue' as const },
        { title: 'Priority Calls', value: priorityCount.toString(), change: '-8% from yesterday', changeType: 'positive' as const, icon: Phone, color: 'red' as const },
        { title: 'Email Queue', value: normalCount.toString(), change: '+5% from last hour', changeType: 'neutral' as const, icon: Mail, color: 'orange' as const },
        { title: 'Avg Response Time', value: '2.3 min', change: '-15 sec faster', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
        { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.2 from last month', changeType: 'positive' as const, icon: TrendingUp, color: 'green' as const },
        { title: 'Active Agents', value: '23', change: '5 on break', changeType: 'neutral' as const, icon: Users, color: 'blue' as const },
        { title: 'Waste Reduction', value: '₹8.5L', change: 'Saved this month', changeType: 'positive' as const, icon: TrendingUp, color: 'green' as const },
      ];
    }

    if (user?.role === 'caller') {
      return [
        { title: 'Priority Calls Today', value: priorityToday.toString(), change: '3 pending', changeType: 'neutral' as const, icon: Phone, color: 'red' as const },
        { title: 'Escalations Handled', value: normalCount.toString(), change: '+2 from yesterday', changeType: 'neutral' as const, icon: AlertTriangle, color: 'orange' as const },
        { title: 'Avg Call Duration', value: '4.2 min', change: '-30 sec shorter', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
      ];
    }

    if (user?.role === 'email_team') {
      return [
        { title: 'Emails Sent Today', value: normalCount.toString(), change: '+8 from yesterday', changeType: 'positive' as const, icon: Mail, color: 'blue' as const },
        { title: 'Avg Response Time', value: '1.8 min', change: '-22 sec faster', changeType: 'positive' as const, icon: Clock, color: 'purple' as const },
        { title: 'Email Success Rate', value: '98.5%', change: 'Delivery rate', changeType: 'positive' as const, icon: CheckCircle, color: 'green' as const },
      ];
    }

    return [];
  };

  const metrics = getMetrics();


  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-r from-blue-800 to-green-600 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 bg-white"
        ></div>
        <div className="relative z-10 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-base text-gray-300">
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
              <TicketChart tickets={tickets} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Priority Distribution
              </h3>
              <PriorityDistribution tickets={tickets} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Activity Feed
            </h3>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket, index) => {
                const timeAgo = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60)) + ' min ago';
                const color = ticket.priority === 'priority' ? 'red' : 'blue';
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`h-2 w-2 rounded-full bg-${color}-500`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{ticket.title} - {ticket.priority} priority</p>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
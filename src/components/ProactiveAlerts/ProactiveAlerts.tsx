import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Server, Users, Clock, CheckCircle, Activity } from 'lucide-react';
import { ProactiveAlert } from '../../types';
import { TicketService } from '../../services/ticketService';
import toast from 'react-hot-toast';

export const ProactiveAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const fetchedAlerts = await TicketService.getProactiveAlerts(20);
        setAlerts(fetchedAlerts);
      } catch (error) {
        console.error('Error fetching proactive alerts:', error);
        toast.error('Failed to load proactive alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const activeAlerts = alerts.filter(alert => !alert.resolvedAt);
  const resolvedAlerts = alerts.filter(alert => alert.resolvedAt);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'performance': return Server;
      case 'quality': return TrendingUp;
      case 'user_behavior': return Users;
      case 'system': return Activity;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proactive Issue Detection</h2>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Proactive Issue Detection</h2>
        <p className="text-gray-600">
          AI-powered monitoring system detecting and preventing issues before they impact customers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{activeAlerts.length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{resolvedAlerts.length}</div>
              <div className="text-sm text-gray-600">Resolved Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {alerts.length > 0 ? formatTimeAgo(alerts[0].createdAt) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Latest Alert</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const IconComponent = getIconForType(alert.type);
              return (
                <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Affected users: <span className="font-medium">{alert.affectedUsers}</span>
                    </span>
                    <span className="text-green-600 font-medium">{alert.action}</span>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200">
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Resolved</h3>
            <div className="space-y-3">
              {resolvedAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{alert.resolvedAt ? formatTimeAgo(alert.resolvedAt) : 'Recently'}</span>
                      <span className="text-xs text-gray-500">{alert.affectedUsers} users</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prevention Impact</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tickets Prevented</span>
                <span className="text-lg font-bold text-green-600">
                  {alerts.reduce((sum, alert) => sum + (alert.preventedTickets || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Affected Users</span>
                <span className="text-lg font-bold text-green-600">
                  {alerts.reduce((sum, alert) => sum + alert.affectedUsers, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Monitoring</span>
                <span className="text-lg font-bold text-green-600">{activeAlerts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
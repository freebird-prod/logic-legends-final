import React from 'react';
import { AlertTriangle, TrendingUp, Server, Users, Clock, CheckCircle } from 'lucide-react';

export const ProactiveAlerts: React.FC = () => {
  const activeAlerts = [
    {
      id: '1',
      type: 'performance',
      title: 'High Server Load Detected',
      description: 'Server response times increased by 40% in the last 15 minutes',
      severity: 'warning',
      affectedUsers: 450,
      action: 'Auto-scaling initiated',
      time: '5 minutes ago',
      icon: Server,
    },
    {
      id: '2',
      type: 'quality',
      title: 'Product Return Rate Spike',
      description: 'Return requests for Product #1247 increased by 200%',
      severity: 'critical',
      affectedUsers: 23,
      action: 'Quality team notified',
      time: '12 minutes ago',
      icon: TrendingUp,
    },
    {
      id: '3',
      type: 'user_behavior',
      title: 'Unusual Login Failure Pattern',
      description: 'Multiple failed login attempts from new users',
      severity: 'info',
      affectedUsers: 78,
      action: 'Password reset emails sent',
      time: '18 minutes ago',
      icon: Users,
    },
  ];

  const resolvedAlerts = [
    {
      id: '4',
      title: 'Payment Gateway Timeout',
      description: 'Payment processing delays resolved',
      resolvedAt: '1 hour ago',
      affectedUsers: 156,
    },
    {
      id: '5',
      title: 'Email Service Disruption',
      description: 'Email delivery service restored',
      resolvedAt: '2 hours ago',
      affectedUsers: 89,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
              <div className="text-2xl font-bold text-gray-900">3</div>
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
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Issues Prevented</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2.3 min</div>
              <div className="text-sm text-gray-600">Avg Detection Time</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const IconComponent = alert.icon;
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
                    <span className="text-xs text-gray-500">{alert.time}</span>
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
              {resolvedAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{alert.resolvedAt}</span>
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
                <span className="text-lg font-bold text-green-600">847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost Savings</span>
                <span className="text-lg font-bold text-green-600">₹28,50,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Satisfaction</span>
                <span className="text-lg font-bold text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
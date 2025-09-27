import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Leaf,
  Zap,
  Globe,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { MetricCard } from '../Dashboard/MetricCard';
import { mockAnalytics, mockProactiveAlerts } from '../../data/mockAnalytics';

export const EnhancedAnalytics: React.FC = () => {
  const analytics = mockAnalytics;
  const alerts = mockProactiveAlerts;

  const sustainabilityMetrics = [
    {
      title: 'Energy Efficiency',
      value: `${analytics.sustainability.energyEfficiency}%`,
      change: '+2.1% this month',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'green' as const
    },
    {
      title: 'Digital-First Rate',
      value: `${analytics.sustainability.digitalFirstRate}%`,
      change: '+5.3% improvement',
      changeType: 'positive' as const,
      icon: Globe,
      color: 'blue' as const
    },
    {
      title: 'Proactive Resolution',
      value: `${analytics.sustainability.proactiveResolutionRate}%`,
      change: '+8.7% this quarter',
      changeType: 'positive' as const,
      icon: Target,
      color: 'purple' as const
    },
    {
      title: 'Carbon Footprint Saved',
      value: `${analytics.wasteReduction.carbonSaved} tons`,
      change: 'CO₂ equivalent',
      changeType: 'positive' as const,
      icon: Leaf,
      color: 'green' as const
    },
  ];

  const wasteCategories = [
    {
      name: 'Product Defects',
      value: analytics.wasteReduction.wasteByCategory.product_defect,
      percentage: 42,
      color: 'bg-red-500',
      trend: -12
    },
    {
      name: 'Shipping Errors',
      value: analytics.wasteReduction.wasteByCategory.shipping_error,
      percentage: 25,
      color: 'bg-orange-500',
      trend: -8
    },
    {
      name: 'User Confusion',
      value: analytics.wasteReduction.wasteByCategory.user_confusion,
      percentage: 23,
      color: 'bg-yellow-500',
      trend: -15
    },
    {
      name: 'Process Issues',
      value: analytics.wasteReduction.wasteByCategory.process_issue,
      percentage: 10,
      color: 'bg-blue-500',
      trend: -5
    },
  ];

  const predictiveInsights = [
    {
      title: 'Server Load Prediction',
      description: 'High traffic expected in 2 hours based on historical patterns',
      confidence: 94,
      action: 'Auto-scaling scheduled',
      type: 'performance',
    },
    {
      title: 'Product Quality Alert',
      description: 'Batch #4521 showing 15% higher defect rate than average',
      confidence: 87,
      action: 'Quality team notified',
      type: 'quality',
    },
    {
      title: 'Customer Churn Risk',
      description: '23 customers showing early churn indicators',
      confidence: 91,
      action: 'Retention campaign triggered',
      type: 'customer',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-r from-green-600 to-blue-600 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        ></div>
        <div className="relative z-10 p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Advanced Analytics Dashboard</h2>
          <p className="text-lg opacity-90">
            Comprehensive insights into system performance, sustainability impact, and predictive analytics.
          </p>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Leaf className="h-5 w-5 text-green-600 mr-2" />
          Sustainability & Green AI Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sustainabilityMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Waste Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Categories Analysis</h3>
          <div className="space-y-4">
            {wasteCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">${category.value.toLocaleString()}</span>
                    <span className={`text-xs flex items-center ${category.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {category.trend < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                      {Math.abs(category.trend)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${category.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{analytics.wasteReduction.carbonSaved} tons</div>
              <div className="text-sm text-gray-600">CO₂ Emissions Reduced</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">1,247</div>
                <div className="text-xs text-gray-600">Digital Resolutions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">89%</div>
                <div className="text-xs text-gray-600">Paperless Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-purple-600 mr-2" />
          Predictive Insights & Proactive Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictiveInsights.map((insight, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {insight.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600 font-medium">{insight.action}</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
          Active Proactive Alerts
        </h3>
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`h-2 w-2 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-600">{alert.action}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleTimeString()}
                </p>
                <p className="text-xs text-green-600">
                  {alert.preventedTickets} tickets prevented
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Classification Accuracy</span>
              <span className="text-lg font-bold text-green-600">96.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sentiment Analysis</span>
              <span className="text-lg font-bold text-blue-600">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Auto-Resolution Rate</span>
              <span className="text-lg font-bold text-purple-600">78.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Model Efficiency</span>
              <span className="text-lg font-bold text-green-600">92.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cost Savings</span>
              <span className="text-lg font-bold text-green-600">$42,350</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time Saved</span>
              <span className="text-lg font-bold text-blue-600">847 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="text-lg font-bold text-purple-600">+12%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-lg font-bold text-green-600">-45%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
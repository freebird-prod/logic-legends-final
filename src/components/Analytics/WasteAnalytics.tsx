import React from 'react';
import { TrendingDown, Package, RefreshCw, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { MetricCard } from '../Dashboard/MetricCard';

export const WasteAnalytics: React.FC = () => {
  const wasteMetrics = [
    { title: 'Product Defect Tickets', value: '89', change: '-12% from last month', changeType: 'positive' as const, icon: Package, color: 'red' as const },
    { title: 'Return/Replacement Costs', value: '₹2,85,000', change: '₹53,000 saved', changeType: 'positive' as const, icon: RefreshCw, color: 'orange' as const },
    { title: 'Shipping Error Tickets', value: '34', change: '-6 fewer errors', changeType: 'positive' as const, icon: AlertTriangle, color: 'orange' as const },
    { title: 'Total Waste Reduction', value: '₹8,50,000', change: '₹1,40,000 this month', changeType: 'positive' as const, icon: DollarSign, color: 'green' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Waste Reduction Analytics</h2>
        <p className="text-gray-600">
          Track and reduce operational waste through AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wasteMetrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Categories Breakdown</h3>
          <div className="space-y-4">
            {[
              { category: 'Product Defects', amount: '₹3,50,000', percentage: 42, color: 'bg-red-500' },
              { category: 'Shipping Errors', amount: '₹2,10,000', percentage: 25, color: 'bg-orange-500' },
              { category: 'User Confusion', amount: '₹1,90,000', percentage: 23, color: 'bg-yellow-500' },
              { category: 'Process Issues', amount: '₹1,00,000', percentage: 10, color: 'bg-blue-500' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className="text-sm text-gray-600">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Improvement Opportunities</h3>
          <div className="space-y-4">
            {[
              {
                title: 'Optimize Product Documentation',
                description: 'Reduce confusion tickets by 30%',
                impact: '₹1,60,000/month',
                status: 'in-progress',
                icon: CheckCircle,
              },
              {
                title: 'Improve QA Process',
                description: 'Reduce defect tickets by 25%',
                impact: '₹1,20,000/month',
                status: 'planned',
                icon: Package,
              },
              {
                title: 'Enhanced Packaging',
                description: 'Reduce shipping damage by 40%',
                impact: '₹80,000/month',
                status: 'proposed',
                icon: RefreshCw,
              },
            ].map((opportunity, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <opportunity.icon className="h-5 w-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{opportunity.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-green-600">Save {opportunity.impact}</span>
                      <span className={`text-xs px-2 py-1 rounded-md ${opportunity.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : opportunity.status === 'planned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {opportunity.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Environmental Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingDown className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">2.4 tons</div>
            <div className="text-sm text-gray-600">CO₂ Emissions Reduced</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">1,200</div>
            <div className="text-sm text-gray-600">Packages Optimized</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">89%</div>
            <div className="text-sm text-gray-600">Digital-First Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
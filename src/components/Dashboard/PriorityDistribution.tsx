import React from 'react';

export const PriorityDistribution: React.FC = () => {
  const data = [
    { label: 'Normal', value: 68, color: 'bg-green-500' },
    { label: 'Moderate', value: 24, color: 'bg-orange-500' },
    { label: 'Priority', value: 8, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <span className="text-sm text-gray-600">{item.value}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${item.color} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${item.value}%` }}
            ></div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">AI Classification Accuracy</h4>
        <div className="text-2xl font-bold text-green-600">96.8%</div>
        <p className="text-xs text-gray-500">+2.3% from last week</p>
      </div>
    </div>
  );
};
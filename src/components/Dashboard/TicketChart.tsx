import React from 'react';

export const TicketChart: React.FC = () => {
  const data = [
    { day: 'Mon', normal: 45, moderate: 23, priority: 8 },
    { day: 'Tue', normal: 52, moderate: 18, priority: 12 },
    { day: 'Wed', normal: 38, moderate: 28, priority: 6 },
    { day: 'Thu', normal: 61, moderate: 15, priority: 9 },
    { day: 'Fri', normal: 48, moderate: 32, priority: 14 },
    { day: 'Sat', normal: 29, moderate: 12, priority: 4 },
    { day: 'Sun', normal: 33, moderate: 16, priority: 7 },
  ];

  const maxValue = Math.max(...data.map(d => d.normal + d.moderate + d.priority));

  return (
    <div className="space-y-4">
      <div className="flex space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-green-500 rounded"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-orange-500 rounded"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-red-500 rounded"></div>
          <span>Priority</span>
        </div>
      </div>

      <div className="flex items-end justify-between space-x-2 h-48">
        {data.map((item, index) => {
          const totalHeight = (item.normal + item.moderate + item.priority) / maxValue * 160;
          const normalHeight = (item.normal / (item.normal + item.moderate + item.priority)) * totalHeight;
          const moderateHeight = (item.moderate / (item.normal + item.moderate + item.priority)) * totalHeight;
          const priorityHeight = (item.priority / (item.normal + item.moderate + item.priority)) * totalHeight;

          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="flex flex-col justify-end" style={{ height: '160px' }}>
                <div className="w-8 bg-red-500 rounded-t" style={{ height: `${priorityHeight}px` }}></div>
                <div className="w-8 bg-orange-500" style={{ height: `${moderateHeight}px` }}></div>
                <div className="w-8 bg-green-500 rounded-b" style={{ height: `${normalHeight}px` }}></div>
              </div>
              <span className="text-xs text-gray-600">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
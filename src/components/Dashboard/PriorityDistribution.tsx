import React from 'react';
import { Ticket } from '../../types';

interface PriorityDistributionProps {
  tickets: Ticket[];
}

export const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ tickets }) => {
  const totalTickets = tickets.length;
  const normalCount = tickets.filter(t => t.priority === 'normal').length;
  const moderateCount = tickets.filter(t => t.priority === 'moderate').length;
  const priorityCount = tickets.filter(t => t.priority === 'priority').length;

  const data = [
    {
      label: 'Normal',
      value: totalTickets > 0 ? Math.round((normalCount / totalTickets) * 100) : 0,
      color: 'bg-green-500'
    },
    {
      label: 'Moderate',
      value: totalTickets > 0 ? Math.round((moderateCount / totalTickets) * 100) : 0,
      color: 'bg-orange-500'
    },
    {
      label: 'Priority',
      value: totalTickets > 0 ? Math.round((priorityCount / totalTickets) * 100) : 0,
      color: 'bg-red-500'
    },
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
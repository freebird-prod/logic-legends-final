import React from 'react';
import { Ticket } from '../../types';

interface TicketChartProps {
  tickets: Ticket[];
}

export const TicketChart: React.FC<TicketChartProps> = ({ tickets }) => {
  // Generate data for the last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  const days = getLast7Days();

  const data = days.map(day => {
    const dayTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      return ticketDate === day;
    });

    return {
      day,
      normal: dayTickets.filter(t => t.priority === 'normal').length,
      priority: dayTickets.filter(t => t.priority === 'priority').length,
    };
  });

  const maxValue = Math.max(...data.map(d => d.normal + d.priority)) || 1;

  return (
    <div className="space-y-4">
      <div className="flex space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-green-500 rounded"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-red-500 rounded"></div>
          <span>Priority</span>
        </div>
      </div>

      <div className="flex items-end justify-between space-x-2 h-48">
        {data.map((item, index) => {
          const totalHeight = (item.normal + item.priority) / maxValue * 160;
          const normalHeight = (item.normal / (item.normal + item.priority)) * totalHeight;
          const priorityHeight = (item.priority / (item.normal + item.priority)) * totalHeight;

          return (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="flex flex-col justify-end" style={{ height: '160px' }}>
                <div className="w-8 bg-red-500 rounded-t" style={{ height: `${priorityHeight}px` }}></div>
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
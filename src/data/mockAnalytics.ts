import { AnalyticsData, ProactiveAlert, TeamMember } from '../types';

export const mockAnalytics: AnalyticsData = {
  totalTickets: 2847,
  resolvedTickets: 2683,
  avgResponseTime: 2.3,
  customerSatisfaction: 4.8,
  wasteReduction: {
    defectTickets: 89,
    returnTickets: 156,
    potentialSavings: 850000, // INR
    carbonSaved: 2.4,
    wasteByCategory: {
      product_defect: 350000, // INR
      shipping_error: 210000, // INR
      user_confusion: 190000, // INR
      process_issue: 100000, // INR
    },
  },
  priorityDistribution: {
    normal: 68,
    moderate: 24,
    priority: 8,
  },
  sustainability: {
    energyEfficiency: 94.2,
    digitalFirstRate: 89.1,
    proactiveResolutionRate: 76.8,
  },
};

export const mockProactiveAlerts: ProactiveAlert[] = [
  {
    id: '1',
    type: 'performance',
    title: 'High Server Load Detected',
    description: 'Server response times increased by 40% in the last 15 minutes',
    severity: 'warning',
    affectedUsers: 450,
    action: 'Auto-scaling initiated',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    preventedTickets: 23,
  },
  {
    id: '2',
    type: 'quality',
    title: 'Product Return Rate Spike',
    description: 'Return requests for Product #1247 increased by 200%',
    severity: 'critical',
    affectedUsers: 23,
    action: 'Quality team notified',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    preventedTickets: 45,
  },
  {
    id: '3',
    type: 'user_behavior',
    title: 'Unusual Login Failure Pattern',
    description: 'Multiple failed login attempts from new users',
    severity: 'info',
    affectedUsers: 78,
    action: 'Password reset emails sent',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    preventedTickets: 12,
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.in',
    role: 'caller',
    status: 'online',
    activeTickets: 3,
    resolvedToday: 12,
    avgResponseTime: 1.8,
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@company.in',
    role: 'caller',
    status: 'busy',
    activeTickets: 5,
    resolvedToday: 8,
    avgResponseTime: 2.1,
  },
  {
    id: '3',
    name: 'Anjali Patel',
    email: 'anjali.patel@company.in',
    role: 'email_team',
    status: 'online',
    activeTickets: 7,
    resolvedToday: 15,
    avgResponseTime: 3.2,
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram.singh@company.in',
    role: 'email_team',
    status: 'away',
    activeTickets: 2,
    resolvedToday: 11,
    avgResponseTime: 2.9,
  },
];
import { Ticket } from '../types';

export const mockTickets: Ticket[] = [
  {
    id: '2847',
    title: 'Cannot access mobile app - urgent business meeting',
    description: 'My mobile app is completely broken and I have an important client meeting in 30 minutes. This is absolutely critical!',
    priority: 'priority',
    category: 'technical',
    status: 'open',
    source: 'chat',
    sentiment: 'frustrated',
    assignedTo: 'Call Team',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      phone: '+1-555-0123'
    }
  },
  {
    id: '2846',
    title: 'Billing question about monthly charges',
    description: 'I noticed an additional charge on my account and would like clarification on what it covers.',
    priority: 'moderate',
    category: 'billing',
    status: 'in_progress',
    source: 'email',
    sentiment: 'neutral',
    assignedTo: 'Email Team',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'Michael Chen',
      email: 'mchen@startup.io',
      phone: '+1-555-0456'
    }
  },
  {
    id: '2845',
    title: 'How to update profile information',
    description: 'I would like to update my profile information but cannot find the settings page.',
    priority: 'normal',
    category: 'account',
    status: 'resolved',
    source: 'chat',
    sentiment: 'positive',
    assignedTo: 'AI Chatbot',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com'
    }
  },
  {
    id: '2844',
    title: 'Product defect - packaging damaged on arrival',
    description: 'The product arrived with damaged packaging and the item inside appears to have defects. Requesting return/replacement.',
    priority: 'moderate',
    category: 'product_quality',
    status: 'open',
    source: 'email',
    sentiment: 'frustrated',
    assignedTo: 'Email Team',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'David Wilson',
      email: 'dwilson@gmail.com',
      phone: '+1-555-0789'
    }
  },
  {
    id: '2843',
    title: 'Server maintenance notification - proactive alert',
    description: 'Scheduled maintenance will occur tonight from 2-4 AM EST. Service may be temporarily unavailable.',
    priority: 'normal',
    category: 'system',
    status: 'closed',
    source: 'api',
    sentiment: 'neutral',
    assignedTo: 'System',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'System Alert',
      email: 'system@company.com'
    }
  },
  {
    id: '2842',
    title: 'Password reset not working',
    description: 'I clicked the password reset link multiple times but never received the email. Please help me regain access to my account.',
    priority: 'moderate',
    category: 'account',
    status: 'in_progress',
    source: 'call',
    sentiment: 'frustrated',
    assignedTo: 'Call Team',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'Jennifer Lee',
      email: 'jlee@company.org',
      phone: '+1-555-0321'
    }
  },
  {
    id: '2841',
    title: 'Thank you for excellent support',
    description: 'I wanted to thank your team for the excellent support I received yesterday. The issue was resolved quickly and professionally.',
    priority: 'normal',
    category: 'feedback',
    status: 'closed',
    source: 'email',
    sentiment: 'positive',
    assignedTo: 'Email Team',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'Robert Martinez',
      email: 'rmartinez@business.net'
    }
  },
  {
    id: '2840',
    title: 'Critical system outage affecting all users',
    description: 'Complete system outage detected. All services are down. Multiple user reports coming in.',
    priority: 'priority',
    category: 'system',
    status: 'resolved',
    source: 'api',
    sentiment: 'angry',
    assignedTo: 'Engineering Team',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    customerInfo: {
      name: 'System Monitor',
      email: 'monitor@company.com'
    }
  }
];

export const getPriorityTickets = () => mockTickets.filter(t => t.priority === 'priority');
export const getModerateTickets = () => mockTickets.filter(t => t.priority === 'moderate');
export const getNormalTickets = () => mockTickets.filter(t => t.priority === 'normal');
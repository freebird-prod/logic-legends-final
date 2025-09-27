export interface User {
  id: string;
  email: string;
  role: 'admin' | 'caller' | 'email_team' | 'customer';
  name: string;
  phone?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'normal' | 'moderate' | 'priority';
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source: 'chat' | 'email' | 'call' | 'api';
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  carbonFootprint?: number;
  wasteCategory?: 'product_defect' | 'shipping_error' | 'user_confusion' | 'process_issue' | null;
  proactiveAlert?: boolean;
  autoResolved?: boolean;
  voiceRecording?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  title?: string;
}

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  wasteReduction: {
    defectTickets: number;
    returnTickets: number;
    potentialSavings: number;
    carbonSaved: number;
    wasteByCategory: {
      product_defect: number;
      shipping_error: number;
      user_confusion: number;
      process_issue: number;
    };
  };
  priorityDistribution: {
    normal: number;
    moderate: number;
    priority: number;
  };
  sustainability: {
    energyEfficiency: number;
    digitalFirstRate: number;
    proactiveResolutionRate: number;
  };
}

export interface ProactiveAlert {
  id: string;
  type: 'performance' | 'quality' | 'user_behavior' | 'system';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  affectedUsers: number;
  action: string;
  createdAt: string;
  resolvedAt?: string;
  preventedTickets?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'caller' | 'email_team';
  status: 'online' | 'busy' | 'away' | 'offline';
  activeTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
}
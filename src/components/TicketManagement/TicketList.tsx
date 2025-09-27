import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Phone, Mail, MessageSquare, Bot, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Ticket } from '../../types';
import { TicketService } from '../../services/ticketService';

interface TicketListProps {
    title: string;
    tickets?: Ticket[]; // Made optional since we'll fetch from Firebase
    showActions?: boolean;
    autoFetch?: boolean; // New prop to control whether to fetch automatically
    onViewTicket?: (ticket: Ticket) => void; // Callback for viewing a ticket
    onResolveTicket?: (ticket: Ticket) => void; // Callback for resolving a ticket
}

export const TicketList: React.FC<TicketListProps> = ({
    title,
    tickets: propTickets = [],
    showActions = true,
    autoFetch = true,
    onViewTicket,
    onResolveTicket
}) => {
    const [tickets, setTickets] = useState<Ticket[]>(propTickets);
    const [loading, setLoading] = useState(false);
    const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Fetch tickets from Firebase
    const fetchTickets = async () => {
        setLoading(true);
        try {
            const fetchedTickets = await TicketService.getRecentTickets(50);
            setTickets(fetchedTickets);
        } catch (err) {
            toast.error('Failed to load tickets. Please try again.');
            console.error('Error fetching tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    // Default resolve handler
    const handleResolveTicket = async (ticket: Ticket) => {
        setResolvingTicketId(ticket.id);
        try {
            await TicketService.updateTicket(ticket.id, { status: 'resolved' });
            toast.success('Ticket resolved successfully!');
            // Refresh the tickets list
            await fetchTickets();
        } catch (err) {
            console.error('Error resolving ticket:', err);
            toast.error('Failed to resolve ticket. Please try again.');
        } finally {
            setResolvingTicketId(null);
        }
    };

    // Default view handler (placeholder)
    const handleViewTicket = (ticket: Ticket) => {
        console.log('Viewing ticket:', ticket);
        // This can be implemented to open a modal or navigate to ticket details
    };

    useEffect(() => {
        if (autoFetch) {
            fetchTickets();
        } else {
            setTickets(propTickets);
        }
    }, [autoFetch, propTickets]);

    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;

        return matchesSearch && matchesPriority && matchesStatus;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'priority': return 'bg-red-100 text-red-800 border-red-200';
            case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'call': return <Phone className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            case 'chat': return <MessageSquare className="h-4 w-4" />;
            case 'api': return <Bot className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive': return 'text-green-600';
            case 'frustrated': return 'text-orange-600';
            case 'angry': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
                ></div>
                <div className="relative z-10 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{title}</h2>
                            <p className="text-sm opacity-90 mt-1">Manage and track all support tickets</p>
                        </div>
                        {autoFetch && (
                            <button
                                onClick={fetchTickets}
                                disabled={loading}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh tickets"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="text-sm">Refresh</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="priority">Priority</option>
                        <option value="moderate">Moderate</option>
                        <option value="normal">Normal</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                            <p className="text-gray-600">Loading tickets...</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    {showActions && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">#{ticket.id.slice(-8)}</div>
                                                <div className="text-sm text-gray-600 max-w-xs truncate">{ticket.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{ticket.category}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{ticket.customerInfo.name}</div>
                                            <div className="text-sm text-gray-600">{ticket.customerInfo.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {getSourceIcon(ticket.source)}
                                                <span className="text-sm text-gray-600 capitalize">{ticket.source}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${getSentimentColor(ticket.sentiment)}`}>
                                                {ticket.sentiment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                            <div className="text-xs text-gray-500">
                                                {new Date(ticket.createdAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        {showActions && (
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => (onViewTicket || handleViewTicket)(ticket)}
                                                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => (onResolveTicket || handleResolveTicket)(ticket)}
                                                        className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                                        disabled={ticket.status === 'resolved' || ticket.status === 'closed' || resolvingTicketId === ticket.id}
                                                    >
                                                        {resolvingTicketId === ticket.id ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                <span>Resolving...</span>
                                                            </>
                                                        ) : (
                                                            <span>{ticket.status === 'resolved' || ticket.status === 'closed' ? 'Resolved' : 'Resolve'}</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && filteredTickets.length === 0 && (
                        <div className="text-center py-12">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No tickets match your current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
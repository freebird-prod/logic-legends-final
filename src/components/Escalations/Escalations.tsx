import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, TrendingUp, CheckCircle, ArrowUp } from 'lucide-react';
import { Ticket } from '../../types';
import { TicketService } from '../../services/ticketService';

export const Escalations: React.FC = () => {
    const [escalatedTickets, setEscalatedTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEscalatedTickets = async () => {
            try {
                // Get priority tickets and moderate tickets that might need escalation
                const [priorityTickets, moderateTickets] = await Promise.all([
                    TicketService.getTicketsByPriority('priority', 50),
                    TicketService.getTicketsByPriority('moderate', 50)
                ]);

                const allTickets = [...priorityTickets, ...moderateTickets];
                // Filter for tickets that are escalated (we'll consider priority tickets or those with sentiment issues)
                const escalated = allTickets.filter((ticket: Ticket) =>
                    ticket.priority === 'priority' ||
                    ticket.sentiment === 'angry' ||
                    ticket.sentiment === 'frustrated'
                );
                setEscalatedTickets(escalated);
            } catch (error) {
                console.error('Error fetching escalated tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEscalatedTickets();
    }, []);

    const handleEscalationResolved = async (ticketId: string) => {
        try {
            await TicketService.updateTicket(ticketId, { status: 'resolved' });
            setEscalatedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        } catch (error) {
            console.error('Error resolving escalation:', error);
        }
    };

    const getEscalationReason = (ticket: Ticket) => {
        if (ticket.priority === 'priority') return 'High Priority';
        if (ticket.sentiment === 'angry') return 'Customer Anger';
        if (ticket.sentiment === 'frustrated') return 'Customer Frustration';
        return 'Requires Attention';
    };

    const getSeverityColor = (ticket: Ticket) => {
        if (ticket.priority === 'priority') return 'bg-red-100 text-red-800 border-red-200';
        if (ticket.sentiment === 'angry') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-orange-100 text-orange-800 border-orange-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Escalations</h2>
                <p className="text-gray-600">
                    High-priority tickets and customer issues requiring immediate escalation and attention.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{escalatedTickets.length}</div>
                            <div className="text-sm text-gray-600">Active Escalations</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {escalatedTickets.filter(t => t.sentiment === 'angry').length}
                            </div>
                            <div className="text-sm text-gray-600">Angry Customers</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {Math.round(escalatedTickets.reduce((acc, t) => {
                                    const hours = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                                    return acc + hours;
                                }, 0) / escalatedTickets.length) || 0}
                            </div>
                            <div className="text-sm text-gray-600">Avg Age (hours)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Escalated Tickets</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {escalatedTickets.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No escalated tickets at this time</p>
                        </div>
                    ) : (
                        escalatedTickets.map((ticket) => (
                            <div key={ticket.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <ArrowUp className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${getSeverityColor(ticket)}`}>
                                                    {getEscalationReason(ticket)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-4 w-4" />
                                                    <span>{ticket.customerInfo.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div className="text-sm">
                                                    Status: <span className="font-medium capitalize">{ticket.status.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${ticket.priority === 'priority' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleEscalationResolved(ticket.id)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Mark Resolved</span>
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                                        Assign to Team
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
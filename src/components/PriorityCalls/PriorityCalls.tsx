import React, { useState, useEffect } from 'react';
import { Phone, Clock, User, AlertTriangle, CheckCircle, PhoneCall } from 'lucide-react';
import { Ticket } from '../../types';
import { TicketService } from '../../services/ticketService';

export const PriorityCalls: React.FC = () => {
    const [priorityTickets, setPriorityTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPriorityTickets = async () => {
            try {
                const tickets = await TicketService.getTicketsByPriority('priority', 100);
                const priorityOnes = tickets.filter((ticket: Ticket) =>
                    (ticket.status === 'open' || ticket.status === 'in_progress') &&
                    ticket.source === 'call'
                );
                setPriorityTickets(priorityOnes);
            } catch (error) {
                console.error('Error fetching priority tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPriorityTickets();
    }, []);

    const handleCallInitiated = async (ticketId: string) => {
        try {
            await TicketService.updateTicket(ticketId, { status: 'in_progress' });
            setPriorityTickets(prev =>
                prev.map(ticket =>
                    ticket.id === ticketId
                        ? { ...ticket, status: 'in_progress' as const }
                        : ticket
                )
            );
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    };

    const handleCallCompleted = async (ticketId: string) => {
        try {
            await TicketService.updateTicket(ticketId, { status: 'resolved' });
            setPriorityTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
        } catch (error) {
            console.error('Error resolving ticket:', error);
        }
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Priority Calls Queue</h2>
                <p className="text-gray-600">
                    High-priority customer calls requiring immediate attention from the call team.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <PhoneCall className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{priorityTickets.length}</div>
                            <div className="text-sm text-gray-600">Pending Calls</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {priorityTickets.filter(t => t.status === 'in_progress').length}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {priorityTickets.filter(t => t.status === 'resolved').length}
                            </div>
                            <div className="text-sm text-gray-600">Resolved Today</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Priority Call Queue</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {priorityTickets.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No priority calls in queue</p>
                        </div>
                    ) : (
                        priorityTickets.map((ticket) => (
                            <div key={ticket.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                                            <p className="text-sm text-gray-600 mb-3">{ticket.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-4 w-4" />
                                                    <span>{ticket.customerInfo.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{ticket.customerInfo.phone || 'No phone'}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${ticket.status === 'in_progress'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {ticket.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    {ticket.status === 'open' && (
                                        <button
                                            onClick={() => handleCallInitiated(ticket.id)}
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                        >
                                            <Phone className="h-4 w-4" />
                                            <span>Start Call</span>
                                        </button>
                                    )}
                                    {ticket.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleCallCompleted(ticket.id)}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Mark Resolved</span>
                                        </button>
                                    )}
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
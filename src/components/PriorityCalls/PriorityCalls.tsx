import React, { useState, useEffect } from 'react';
import { Phone, Clock, User, AlertTriangle, CheckCircle, PhoneCall, Eye } from 'lucide-react';
import { Ticket } from '../../types';
import { TicketService } from '../../services/ticketService';
import toast from 'react-hot-toast';

export const PriorityCalls: React.FC = () => {
    const [priorityTickets, setPriorityTickets] = useState<Ticket[]>([]);
    const [allPriorityCalls, setAllPriorityCalls] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        // Set up real-time listener for tickets
        const unsubscribe = TicketService.listenToTickets((allTickets) => {
            // Filter for priority call tickets that are open or in progress
            const activePriorityCalls = allTickets.filter((ticket: Ticket) =>
                ticket.priority === 'priority' &&
                ticket.source === 'call' &&
                (ticket.status === 'open' || ticket.status === 'in_progress')
            );

            // Filter for all priority call tickets (for metrics)
            const allPriorityCallTickets = allTickets.filter((ticket: Ticket) =>
                ticket.priority === 'priority' &&
                ticket.source === 'call'
            );

            setPriorityTickets(activePriorityCalls);
            setAllPriorityCalls(allPriorityCallTickets);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return unsubscribe;
    }, []);

    const handleCallInitiated = async (ticketId: string) => {
        try {
            const ticket = priorityTickets.find(t => t.id === ticketId);
            await TicketService.updateTicket(ticketId, { status: 'in_progress' });
            setPriorityTickets(prev =>
                prev.map(ticket =>
                    ticket.id === ticketId
                        ? { ...ticket, status: 'in_progress' as const }
                        : ticket
                )
            );
            toast.success(`Call initiated: ${ticket?.title || 'Priority Call'}`);
        } catch (error) {
            console.error('Error updating ticket status:', error);
            toast.error('Failed to start call. Please try again.');
        }
    };

    const handleCallCompleted = async (ticketId: string) => {
        try {
            const ticket = priorityTickets.find(t => t.id === ticketId);
            await TicketService.updateTicket(ticketId, { status: 'resolved' });
            setPriorityTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
            toast.success(`Call resolved: ${ticket?.title || 'Priority Call'}`);
        } catch (error) {
            console.error('Error resolving ticket:', error);
            toast.error('Failed to resolve call. Please try again.');
        }
    };

    const handleViewDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailsModal(true);
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
                                {allPriorityCalls.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Priority Calls</div>
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
                                    <button
                                        onClick={() => handleViewDetails(ticket)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            {showDetailsModal && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Priority Call Details</h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedTicket(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800">
                                        Priority Call
                                    </span>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${selectedTicket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedTicket.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Customer Information</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedTicket.customerInfo.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedTicket.customerInfo.email}</p>
                                        <p><span className="font-medium">Phone:</span> {selectedTicket.customerInfo.phone || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Call Information</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        <p><span className="font-medium">Category:</span> {selectedTicket.category}</p>
                                        <p><span className="font-medium">Source:</span> {selectedTicket.source}</p>
                                        <p><span className="font-medium">Sentiment:</span> {selectedTicket.sentiment}</p>
                                        <p><span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                        <p><span className="font-medium">Updated:</span> {new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedTicket.wasteCategory && (
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Waste Analytics</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p><span className="font-medium">Waste Category:</span> {selectedTicket.wasteCategory}</p>
                                        {selectedTicket.carbonFootprint && (
                                            <p><span className="font-medium">Carbon Footprint:</span> {selectedTicket.carbonFootprint} kg CO2</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                {selectedTicket.status === 'open' && (
                                    <button
                                        onClick={() => handleCallInitiated(selectedTicket.id)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                    >
                                        <Phone className="h-4 w-4" />
                                        <span>Start Call</span>
                                    </button>
                                )}
                                {selectedTicket.status === 'in_progress' && (
                                    <button
                                        onClick={() => handleCallCompleted(selectedTicket.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Mark Resolved</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
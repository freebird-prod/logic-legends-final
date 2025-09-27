import React, { useState, useEffect } from 'react';
import { Mail, Clock, User, AlertCircle, CheckCircle, Eye, MessageSquare } from 'lucide-react';
import { Ticket } from '../../types';
import { TicketService } from '../../services/ticketService';
import toast from 'react-hot-toast';

export const EmailQueue: React.FC = () => {
    const [emailTickets, setEmailTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'priority'>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const unsubscribe = TicketService.listenToEmailTickets((emailTickets) => {
            setEmailTickets(emailTickets);
            setLoading(false);
            setError(null); // Clear any previous errors
        });

        // Cleanup function to unsubscribe on unmount
        return () => {
            try {
                unsubscribe();
            } catch (err) {
                console.error('Error unsubscribing from email tickets listener:', err);
            }
        };
    }, []);

    const handleTakeTicket = async (ticketId: string) => {
        try {
            await TicketService.updateTicket(ticketId, { status: 'in_progress' });
            toast.success('Ticket taken for processing');
        } catch (error) {
            console.error('Error taking ticket:', error);
            toast.error('Failed to take ticket');
        }
    };

    const handleResolveTicket = async (ticketId: string) => {
        try {
            await TicketService.updateTicket(ticketId, { status: 'resolved' });
            toast.success('Ticket resolved successfully');
            setShowDetailsModal(false);
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error resolving ticket:', error);
            toast.error('Failed to resolve ticket');
        }
    };

    const handleViewDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailsModal(true);
    };

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

    const retryConnection = () => {
        setError(null);
        setLoading(true);
        // The useEffect dependency array is empty, so it won't re-run automatically
        // We need to manually trigger the listener setup
        const unsubscribe = TicketService.listenToEmailTickets((emailTickets) => {
            setEmailTickets(emailTickets);
            setLoading(false);
            setError(null);
        });
        // Store the unsubscribe function for cleanup
        return unsubscribe;
    };

    const getPriorityWeight = (priority: string) => {
        switch (priority) {
            case 'priority': return 3;
            case 'moderate': return 2;
            case 'normal': return 1;
            default: return 0;
        }
    };

    const sortedTickets = [...emailTickets].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
            case 'priority':
                aValue = getPriorityWeight(a.priority);
                bValue = getPriorityWeight(b.priority);
                break;
            case 'createdAt':
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                break;
            case 'updatedAt':
            default:
                aValue = new Date(a.updatedAt).getTime();
                bValue = new Date(b.updatedAt).getTime();
                break;
        }

        if (sortOrder === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Queue</h2>
                    <p className="text-gray-600">Loading email tickets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Queue</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                <p className="text-red-800">{error}</p>
                            </div>
                            <button
                                onClick={retryConnection}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Queue</h2>
                <p className="text-gray-600">
                    Manage incoming email support tickets and respond to customer inquiries.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{emailTickets.length}</div>
                            <div className="text-sm text-gray-600">Pending Emails</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {emailTickets.filter(t => t.status === 'in_progress').length}
                            </div>
                            <div className="text-sm text-gray-600">In Progress</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {emailTickets.filter(t => t.priority === 'priority').length}
                            </div>
                            <div className="text-sm text-gray-600">High Priority</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Email Tickets Queue</h3>
                        <div className="flex items-center space-x-4">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="updatedAt-desc">Recently Updated</option>
                                <option value="updatedAt-asc">Oldest Updated</option>
                                <option value="createdAt-desc">Newest Created</option>
                                <option value="createdAt-asc">Oldest Created</option>
                                <option value="priority-desc">Highest Priority</option>
                                <option value="priority-asc">Lowest Priority</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {sortedTickets.length === 0 ? (
                        <div className="text-center py-12">
                            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No email tickets in queue</p>
                        </div>
                    ) : (
                        sortedTickets.map((ticket) => (
                            <div key={ticket.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Mail className="h-5 w-5 text-gray-600" />
                                            <h4 className="text-lg font-medium text-gray-900">{ticket.title}</h4>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-4 w-4" />
                                                <span>{ticket.customerInfo.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatTimeAgo(ticket.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>{ticket.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleViewDetails(ticket)}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 inline mr-1" />
                                            View
                                        </button>
                                        {ticket.status === 'open' && (
                                            <button
                                                onClick={() => handleTakeTicket(ticket.id)}
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                            >
                                                Take Ticket
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Email Ticket Details</h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                                <div className="flex items-center space-x-2 mb-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(selectedTicket.priority)}`}>
                                        {selectedTicket.priority}
                                    </span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(selectedTicket.status)}`}>
                                        {selectedTicket.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-gray-700">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Customer Information</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {selectedTicket.customerInfo.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedTicket.customerInfo.email}</p>
                                        {selectedTicket.customerInfo.phone && (
                                            <p><span className="font-medium">Phone:</span> {selectedTicket.customerInfo.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Ticket Details</h5>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Category:</span> {selectedTicket.category}</p>
                                        <p><span className="font-medium">Source:</span> Email</p>
                                        <p><span className="font-medium">Created:</span> {formatTimeAgo(selectedTicket.createdAt)}</p>
                                        <p><span className="font-medium">Updated:</span> {formatTimeAgo(selectedTicket.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => handleResolveTicket(selectedTicket.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 inline mr-2" />
                                    Mark as Resolved
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
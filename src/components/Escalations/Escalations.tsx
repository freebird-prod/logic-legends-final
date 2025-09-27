import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Clock, User, TrendingUp, CheckCircle, ArrowUp, Users, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { TicketService } from '../../services/ticketService';
import { Ticket, TeamMember } from '../../types';

export const Escalations: React.FC = () => {
    const [escalatedTickets, setEscalatedTickets] = useState<Ticket[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        // Load initial data and set up real-time listener
        const loadInitialData = async () => {
            try {
                const members = await TicketService.getTeamMembers();
                setTeamMembers(members);
            } catch (error) {
                console.error('Error loading team members:', error);
            }
        };

        loadInitialData();

        const unsubscribe = TicketService.listenToTickets((allTickets) => {
            // Filter for call-based tickets that are escalated
            const callEscalations = allTickets.filter((ticket: Ticket) =>
                ticket.source === 'call' &&
                (
                    ticket.priority === 'priority' ||
                    ticket.sentiment === 'angry' ||
                    ticket.sentiment === 'frustrated'
                ) &&
                (ticket.status === 'open' || ticket.status === 'in_progress')
            );
            setEscalatedTickets(callEscalations);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return unsubscribe;
    }, []);

    const handleEscalationResolved = async (ticketId: string) => {
        try {
            const ticket = escalatedTickets.find(t => t.id === ticketId);
            await TicketService.updateTicket(ticketId, { status: 'resolved' });
            // The listener will update the state, so no local filter is needed here, but we do it for immediate visual feedback if the listener is slow.
            setEscalatedTickets(prev => prev.filter(t => t.id !== ticketId));
            toast.success(`Escalation resolved: ${ticket?.title || 'Ticket'}`);
            setShowDetailsModal(false);
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error resolving escalation:', error);
            toast.error('Failed to resolve escalation. Please try again.');
        }
    };

    const handleAssignToTeam = async (ticketId: string, memberId: string) => {
        setAssigning(true);
        try {
            const member = teamMembers.find(m => m.id === memberId);
            await TicketService.updateTicket(ticketId, { assignedTo: memberId, status: 'in_progress' });
            toast.success(`Ticket assigned to ${member?.name || 'team member'}`);
            setShowAssignModal(false);
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error assigning ticket:', error);
            toast.error('Failed to assign ticket. Please try again.');
        } finally {
            setAssigning(false);
        }
    };

    const handleViewDetails = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowDetailsModal(true);
    };

    const getEscalationReason = (ticket: Ticket) => {
        if (ticket.priority === 'priority') return 'Priority Call';
        if (ticket.sentiment === 'angry') return 'Angry Caller';
        if (ticket.sentiment === 'frustrated') return 'Frustrated Caller';
        return 'Call Escalation';
    };

    const getSeverityColor = (ticket: Ticket) => {
        if (ticket.priority === 'priority' || ticket.sentiment === 'angry') return 'bg-red-100 text-red-800 border-red-200';
        if (ticket.sentiment === 'frustrated') return 'bg-orange-100 text-orange-800 border-orange-200';
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const averageAge = useMemo(() => {
        if (escalatedTickets.length === 0) return 0;
        const totalHours = escalatedTickets.reduce((acc, t) => {
            const hours = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
            return acc + hours;
        }, 0);
        return Math.round(totalHours / escalatedTickets.length);
    }, [escalatedTickets]);

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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Escalations 📞🔥</h2>
                <p className="text-gray-600">
                    High-priority call-based customer issues requiring immediate escalation and attention.
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
                                {averageAge}
                            </div>
                            <div className="text-sm text-gray-600">Avg Age (hours)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Escalated Call Tickets</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {escalatedTickets.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No escalated call tickets at this time. Great job! 🎉</p>
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
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                                            <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500">
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
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md text-center ${ticket.priority === 'priority' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleEscalationResolved(ticket.id)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        <span>Mark Resolved</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedTicket(ticket);
                                            setShowAssignModal(true);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                                    >
                                        <Users className="h-4 w-4" />
                                        <span>Assign to Team</span>
                                    </button>
                                    <button
                                        onClick={() => handleViewDetails(ticket)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors"
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

            {/* Assign to Team Modal */}
            {showAssignModal && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Ticket: {selectedTicket.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Select a team member to assign this escalation:
                        </p>

                        <div className="space-y-3">
                            {teamMembers.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No team members available</p>
                            ) : (
                                teamMembers.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => handleAssignToTeam(selectedTicket.id, member.id)}
                                        disabled={assigning}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name} {assigning && selectedTicket.id === selectedTicket.id && '...'}</p>
                                                <p className="text-sm text-gray-600">{member.role} • <span className={`capitalize ${member.status === 'online' ? 'text-green-600' : member.status === 'busy' ? 'text-red-600' : 'text-gray-600'}`}>{member.status}</span></p>
                                            </div>
                                            <div className="text-right text-sm text-gray-500">
                                                <p>{member.activeTickets} active</p>
                                                <p>{member.resolvedToday} resolved today</p>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedTicket(null);
                                }}
                                disabled={assigning}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showDetailsModal && selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6 border-b pb-3">
                            <h3 className="text-xl font-semibold text-gray-900">Ticket Details</h3>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedTicket(null);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                                <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getSeverityColor(selectedTicket)}`}>
                                        {getEscalationReason(selectedTicket)}
                                    </span>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${selectedTicket.priority === 'priority' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {selectedTicket.priority.toUpperCase()}
                                    </span>
                                    <span className="capitalize font-medium text-blue-600">{selectedTicket.status.replace('_', ' ')}</span>
                                    <span className="text-gray-500">ID: {selectedTicket.id}</span>
                                </div>
                            </div>

                            <div>
                                <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedTicket.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Customer Information</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                        <p><span className="font-medium">Name:</span> {selectedTicket.customerInfo.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedTicket.customerInfo.email}</p>
                                        <p><span className="font-medium">Phone:</span> {selectedTicket.customerInfo.phone || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Ticket Information</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                                        <p><span className="font-medium">Category:</span> {selectedTicket.category}</p>
                                        <p><span className="font-medium">Source:</span> <span className='capitalize'>{selectedTicket.source}</span></p>
                                        <p><span className="font-medium">Sentiment:</span> <span className='capitalize'>{selectedTicket.sentiment}</span></p>
                                        <p><span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                                        <p><span className="font-medium">Updated:</span> {new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedTicket.wasteCategory && (
                                <div>
                                    <h5 className="font-medium text-gray-900 mb-2">Waste Analytics</h5>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                        <p><span className="font-medium">Waste Category:</span> {selectedTicket.wasteCategory}</p>
                                        {selectedTicket.carbonFootprint && (
                                            <p><span className="font-medium">Carbon Footprint:</span> {selectedTicket.carbonFootprint} kg CO2</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleEscalationResolved(selectedTicket.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Mark Resolved</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        setShowAssignModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Assign to Team</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
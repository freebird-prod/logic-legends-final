import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { Ticket } from '../types';

export class TicketService {
    private static readonly COLLECTION_NAME = 'tickets';

    /**
     * Create a new ticket in Firestore
     */
    static async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const now = Timestamp.now();

            const ticket: Omit<Ticket, 'id'> = {
                ...ticketData,
                createdAt: now.toDate().toISOString(),
                updatedAt: now.toDate().toISOString(),
            };

            const docRef = await addDoc(collection(db, this.COLLECTION_NAME), ticket);
            return docRef.id;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw new Error('Failed to create ticket');
        }
    }

    /**
     * Get a ticket by ID
     */
    static async getTicket(ticketId: string): Promise<Ticket | null> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, ticketId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Ticket;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting ticket:', error);
            throw new Error('Failed to get ticket');
        }
    }

    /**
     * Update a ticket
     */
    static async updateTicket(ticketId: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>): Promise<void> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, ticketId);
            const updateData = {
                ...updates,
                updatedAt: Timestamp.now().toDate().toISOString(),
            };

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw new Error('Failed to update ticket');
        }
    }

    /**
     * Get tickets by status
     */
    static async getTicketsByStatus(status: Ticket['status'], limitCount: number = 50): Promise<Ticket[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('status', '==', status),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
        } catch (error) {
            console.error('Error getting tickets by status:', error);
            throw new Error('Failed to get tickets');
        }
    }

    /**
     * Get tickets by priority
     */
    static async getTicketsByPriority(priority: Ticket['priority'], limitCount: number = 50): Promise<Ticket[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('priority', '==', priority),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
        } catch (error) {
            console.error('Error getting tickets by priority:', error);
            throw new Error('Failed to get tickets');
        }
    }

    /**
     * Get recent tickets
     */
    static async getRecentTickets(limitCount: number = 20): Promise<Ticket[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Ticket));
        } catch (error) {
            console.error('Error getting recent tickets:', error);
            throw new Error('Failed to get recent tickets');
        }
    }
}
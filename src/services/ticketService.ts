import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit, Timestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebaseConfig';
import { Ticket, ProactiveAlert, ChatSession } from '../types';

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

    /**
     * Get proactive alerts
     */
    static async getProactiveAlerts(limitCount: number = 10): Promise<ProactiveAlert[]> {
        try {
            const q = query(
                collection(db, 'proactiveAlerts'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ProactiveAlert));
        } catch (error) {
            console.error('Error getting proactive alerts:', error);
            throw new Error('Failed to get proactive alerts');
        }
    }

    /**
     * Save chat session
     */
    static async saveChatSession(chatSession: Omit<ChatSession, 'id'>): Promise<string> {
        try {
            const now = Timestamp.now();
            const chat: Omit<ChatSession, 'id'> = {
                ...chatSession,
                updatedAt: now.toDate().toISOString(),
            };

            const docRef = await addDoc(collection(db, 'chatSessions'), chat);
            return docRef.id;
        } catch (error) {
            console.error('Error saving chat session:', error);
            throw new Error('Failed to save chat session');
        }
    }

    /**
     * Update chat session
     */
    static async updateChatSession(chatId: string, updates: Partial<Omit<ChatSession, 'id'>>): Promise<void> {
        try {
            const docRef = doc(db, 'chatSessions', chatId);
            const updateData = {
                ...updates,
                updatedAt: Timestamp.now().toDate().toISOString(),
            };

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error('Error updating chat session:', error);
            throw new Error('Failed to update chat session');
        }
    }

    /**
     * Get chat session by ID
     */
    static async getChatSession(chatId: string): Promise<ChatSession | null> {
        try {
            const docRef = doc(db, 'chatSessions', chatId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as ChatSession;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting chat session:', error);
            throw new Error('Failed to get chat session');
        }
    }

    /**
     * Listen to real-time chat sessions updates
     */
    static listenToChatSessions(callback: (chatSessions: ChatSession[]) => void, limitCount: number = 20): () => void {
        const q = query(
            collection(db, 'chatSessions'),
            orderBy('updatedAt', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatSessions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ChatSession));
            callback(chatSessions);
        }, (error) => {
            console.error('Error listening to chat sessions:', error);
        });

        return unsubscribe;
    }

    /**
     * Listen to real-time updates for a specific chat session
     */
    static listenToChatSession(chatId: string, callback: (chatSession: ChatSession | null) => void): () => void {
        const docRef = doc(db, 'chatSessions', chatId);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const chatSession = {
                    id: docSnap.id,
                    ...docSnap.data()
                } as ChatSession;
                callback(chatSession);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Error listening to chat session:', error);
        });

        return unsubscribe;
    }

    /**
     * Delete a chat session
     */
    static async deleteChatSession(chatId: string): Promise<void> {
        try {
            const docRef = doc(db, 'chatSessions', chatId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting chat session:', error);
            throw new Error('Failed to delete chat session');
        }
    }
}
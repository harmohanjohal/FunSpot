import { API_CONFIG } from '../config';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

// Helper function to generate statistics from Firebase events
export const getEventStatistics = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => doc.data());

    return {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) >= new Date()).length,
      pastEvents: events.filter(e => new Date(e.date) < new Date()).length,
      totalTicketsSource: events.reduce((sum, e) => sum + (Number(e.totalTickets) || Number(e.total_tickets) || 0), 0),
      totalBookedTickets: events.reduce((sum, e) => sum + (Number(e.bookedTickets) || Number(e.booked_tickets) || 0), 0)
    };
  } catch (error) {
    console.error('Error calculating statistics from Firebase:', error);
    throw error;
  }
};

// Create a new event (admin only)
export const createEvent = async (eventData) => {
  try {
    // Let Firestore generate a new ID
    const newRef = doc(collection(db, 'events'));
    await setDoc(newRef, eventData);
    return { id: newRef.id, ...eventData, message: 'Event created successfully' };
  } catch (error) {
    console.error('Error creating event in Firebase:', error);
    throw error;
  }
};

// Update an existing event (admin only)
export const updateEvent = async (eventId, eventData) => {
  try {
    const docRef = doc(db, 'events', eventId);
    // Use merge: true to avoid overwriting fields not provided
    await setDoc(docRef, eventData, { merge: true });
    return { id: eventId, ...eventData, message: 'Event updated successfully' };
  } catch (error) {
    console.error('Error updating event in Firebase:', error);
    throw error;
  }
};

// Delete an event (admin only)
export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, 'events', eventId));
    return { success: true, message: 'Event cancelled successfully' };
  } catch (error) {
    console.error('Error deleting event in Firebase:', error);
    throw error;
  }
};
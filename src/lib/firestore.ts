import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  limit,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { EmergencyContact } from '@/types';

const CONTACTS_COLLECTION = 'contacts'; // This will be nested under users/{userId}/

// Get contacts for a user
export const getEmergencyContacts = async (userId: string): Promise<EmergencyContact[]> => {
  if (!userId) {
    console.error("User ID is required to fetch contacts.");
    return [];
  }
  try {
    const contactsRef = collection(db, 'users', userId, CONTACTS_COLLECTION);
    const q = query(contactsRef, orderBy('name'), limit(6)); // Order by name, limit to 6
    const querySnapshot = await getDocs(q);
    const contacts: EmergencyContact[] = [];
    querySnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() } as EmergencyContact);
    });
    return contacts;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
};

// Add a new emergency contact
export const addEmergencyContact = async (userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> => {
  if (!userId) throw new Error("User ID is required.");
  try {
    const contactsRef = collection(db, 'users', userId, CONTACTS_COLLECTION);
    // Check current number of contacts
    const currentContactsSnapshot = await getDocs(contactsRef);
    if (currentContactsSnapshot.size >= 6) {
      throw new Error("Maximum of 6 emergency contacts allowed.");
    }

    const docRef = await addDoc(contactsRef, {
      ...contact,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...contact };
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

// Update an emergency contact (using setDoc with merge = true)
export const updateEmergencyContact = async (
  userId: string,
  contactId: string,
  updates: Partial<EmergencyContact>
): Promise<void> => {
  if (!userId || !contactId) throw new Error("User ID and Contact ID are required.");
  try {
    const contactDocRef = doc(db, 'users', userId, CONTACTS_COLLECTION, contactId);
    await setDoc(contactDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true }); // This handles both update and create if not exists
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};

// Delete an emergency contact
export const deleteEmergencyContact = async (userId: string, contactId: string): Promise<void> => {
  if (!userId || !contactId) throw new Error("User ID and Contact ID are required.");
  try {
    const contactDocRef = doc(db, 'users', userId, CONTACTS_COLLECTION, contactId);
    await deleteDoc(contactDocRef);
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    throw error;
  }
};

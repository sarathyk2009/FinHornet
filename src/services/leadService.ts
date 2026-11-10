import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CallbackLead {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  examWindow: string;
  message?: string;
  status: 'pending' | 'contacted';
  submittedAt: string;
  notes?: string;
}

const LOCAL_STORAGE_KEY = 'finhornet_callback_leads';

export const INITIAL_LEADS: CallbackLead[] = [
  {
    id: 'lead-sample-101',
    fullName: 'Ananya Sharma',
    phone: '+91 98450 11223',
    email: 'ananya.sharma@example.com',
    examWindow: 'Jan/Feb 2027 Testing Window',
    message: 'Looking for 1-on-1 guidance on Variance Analysis and Prometric mock exam subscription.',
    status: 'pending',
    submittedAt: '2026-10-26 14:32',
    notes: 'Requested WhatsApp callback in the evening.',
  },
  {
    id: 'lead-sample-102',
    fullName: 'Rohan Mehra',
    phone: '+91 97112 44556',
    email: 'rohan.m@example.com',
    examWindow: 'May/June 2027 Testing Window',
    message: 'Interested in Part 1 + Part 2 combo package discount.',
    status: 'contacted',
    submittedAt: '2026-10-25 11:15',
    notes: 'Contacted on phone. Offered 50% discount coupon SAVE50.',
  },
];

export async function submitCallbackRequest(
  data: Omit<CallbackLead, 'id' | 'status' | 'submittedAt'>
): Promise<CallbackLead> {
  const newLead: CallbackLead = {
    ...data,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  try {
    const docRef = doc(db, 'callback_requests', newLead.id);
    await setDoc(docRef, newLead);
  } catch (error) {
    console.warn('Could not save lead directly to Firestore, saving locally:', error);
  }

  // Update local storage backup
  try {
    const current = getLocalLeads();
    const updated = [newLead, ...current];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // ignore
  }

  return newLead;
}

function getLocalLeads(): CallbackLead[] {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // ignore
    }
  }
  return INITIAL_LEADS;
}

export async function getCallbackLeadsFromFirestore(): Promise<CallbackLead[]> {
  try {
    const colRef = collection(db, 'callback_requests');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items: CallbackLead[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CallbackLead;
        items.push({ ...data, id: docSnap.id });
      });
      // Sort newest first
      items.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      return items;
    }
  } catch (error) {
    console.warn('Could not fetch callback requests from Firestore, using local fallback:', error);
  }

  return getLocalLeads();
}

export async function updateCallbackLeadStatus(
  id: string,
  status: 'pending' | 'contacted',
  notes?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'callback_requests', id);
    const updates: Partial<CallbackLead> = { status };
    if (notes !== undefined) updates.notes = notes;
    await updateDoc(docRef, updates);
  } catch (error) {
    console.warn('Could not update lead in Firestore, updating local storage:', error);
  }

  // Update local storage
  const current = getLocalLeads();
  const updated = current.map((lead) =>
    lead.id === id ? { ...lead, status, notes: notes !== undefined ? notes : lead.notes } : lead
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

export async function deleteCallbackLead(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'callback_requests', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete lead in Firestore, removing from local storage:', error);
  }

  // Update local storage
  const current = getLocalLeads();
  const updated = current.filter((lead) => lead.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
}

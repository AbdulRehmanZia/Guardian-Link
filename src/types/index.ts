export type User = {
  uid: string;
  email: string | null;
  displayName?: string | null;
};

export interface EmergencyContact {
  id?: string; // Firestore document ID
  name: string;
  whatsappNumber: string; // Should include country code, e.g., +1XXXXXXXXXX
}

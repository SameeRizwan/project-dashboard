
import {
    collection,
    getDocs,
    addDoc,
    doc,
    deleteDoc,
    query,
    where,
    Timestamp,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TimeEntry = {
    id: string;
    userId: string;
    projectId: string;
    projectName: string; // Denormalized for easier display
    taskDescription: string;
    date: Date;
    hours: number;
    billable: boolean;
    createdAt: Date;
};

// Firestore data shape
type TimeEntryFirestore = Omit<TimeEntry, "id" | "date" | "createdAt"> & {
    date: Timestamp;
    createdAt: Timestamp;
};

const COLLECTION_NAME = "time_entries";

export const timeService = {
    async getTimeEntries(userId: string): Promise<TimeEntry[]> {
        try {
            // Simplified query: get all entries for user
            // In a real app, you would filter by date range
            const q = query(
                collection(db, COLLECTION_NAME),
                where("userId", "==", userId),
                orderBy("date", "desc")
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data() as TimeEntryFirestore;
                return {
                    ...data,
                    id: doc.id,
                    date: data.date.toDate(),
                    createdAt: data.createdAt.toDate(),
                };
            });
        } catch (error) {
            console.error("Error fetching time entries:", error);
            // Fallback for indexes building or other errors
            return [];
        }
    },

    async addTimeEntry(entry: Omit<TimeEntry, "id" | "createdAt">): Promise<TimeEntry> {
        try {
            const now = new Date();
            const firestoreData: Omit<TimeEntryFirestore, "id"> = {
                ...entry,
                date: Timestamp.fromDate(entry.date),
                createdAt: Timestamp.fromDate(now),
            };

            const docRef = await addDoc(collection(db, COLLECTION_NAME), firestoreData);

            return {
                ...entry,
                id: docRef.id,
                createdAt: now,
            };
        } catch (error) {
            console.error("Error adding time entry:", error);
            throw error;
        }
    },

    async deleteTimeEntry(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting time entry:", error);
            throw error;
        }
    }
};

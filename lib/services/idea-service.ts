
import {
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Idea } from "@/components/ideas/types";

const COLLECTION_NAME = "ideas";

export const ideaService = {
    async getAllIdeas(): Promise<Idea[]> {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate(),
                } as Idea;
            });
        } catch (error) {
            console.error("Error fetching ideas:", error);
            return [];
        }
    },

    async addIdea(idea: Omit<Idea, "id" | "createdAt" | "updatedAt">): Promise<void> {
        try {
            await addDoc(collection(db, COLLECTION_NAME), {
                ...idea,
                createdAt: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error adding idea:", error);
            throw error;
        }
    },

    async updateIdea(id: string, updates: Partial<Omit<Idea, "id" | "createdAt">>): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error("Error updating idea:", error);
            throw error;
        }
    },

    async deleteIdea(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting idea:", error);
            throw error;
        }
    }
};

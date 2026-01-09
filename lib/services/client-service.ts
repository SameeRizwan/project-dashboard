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

export type Client = {
    id: string;
    name: string;
    email: string;
    company: string;
    phone?: string;
    status: "active" | "inactive" | "lead";
    projectCount: number;
    totalValue?: number;
    avatar?: string;
    createdAt: Date;
    notes?: string;
};

type ClientFirestore = Omit<Client, "id" | "createdAt"> & {
    createdAt: Timestamp;
};

const COLLECTION_NAME = "clients";

export const clientService = {
    async getAllClients(): Promise<Client[]> {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map((doc) => {
                const data = doc.data() as ClientFirestore;
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as Client;
            });
        } catch (error) {
            console.error("Error fetching clients:", error);
            return [];
        }
    },

    async createClient(client: Omit<Client, "id" | "createdAt">): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...client,
                createdAt: Timestamp.now(),
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    },

    async updateClient(id: string, updates: Partial<Omit<Client, "id" | "createdAt">>): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating client:", error);
            throw error;
        }
    },

    async deleteClient(id: string): Promise<void> {
        try {
            const docRef = doc(db, COLLECTION_NAME, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting client:", error);
            throw error;
        }
    },

    // Seed sample clients for development
    async seedClients(): Promise<void> {
        const sampleClients: Omit<Client, "id" | "createdAt">[] = [
            {
                name: "Acme Corporation",
                email: "contact@acme.com",
                company: "Acme Corp",
                phone: "+1 555-0100",
                status: "active",
                projectCount: 3,
                totalValue: 125000,
                notes: "Key enterprise client",
            },
            {
                name: "TechStart Inc",
                email: "hello@techstart.io",
                company: "TechStart",
                phone: "+1 555-0101",
                status: "active",
                projectCount: 2,
                totalValue: 45000,
            },
            {
                name: "Global Finance",
                email: "projects@globalfinance.com",
                company: "Global Finance Ltd",
                phone: "+1 555-0102",
                status: "active",
                projectCount: 5,
                totalValue: 280000,
                notes: "Premium banking client",
            },
            {
                name: "HealthPlus",
                email: "dev@healthplus.org",
                company: "HealthPlus Foundation",
                status: "lead",
                projectCount: 0,
                totalValue: 0,
            },
            {
                name: "RetailMax",
                email: "tech@retailmax.com",
                company: "RetailMax LLC",
                phone: "+1 555-0104",
                status: "inactive",
                projectCount: 1,
                totalValue: 18000,
            },
        ];

        for (const client of sampleClients) {
            await this.createClient(client);
        }
        console.log("Clients seeded!");
    },
};

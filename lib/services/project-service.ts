
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
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { projects as mockProjects, type Project } from "@/lib/data/projects";
import { ProjectData } from "@/components/project-wizard/types";

// Collection name
const COLLECTION_NAME = "projects";

// Type for Firestore data (converting Dates to Timestamps)
export type ProjectFirestore = Omit<Project, "startDate" | "endDate" | "tasks"> & {
    startDate: Timestamp;
    endDate: Timestamp;
    tasks: Array<any>; // Simplified for now
};

export const projectService = {
    // Fetch all projects
    async getAllProjects(): Promise<Project[]> {
        try {
            const q = query(collection(db, COLLECTION_NAME));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data() as ProjectFirestore;
                // Convert Timestamps back to Dates
                return {
                    ...data,
                    id: doc.id,
                    startDate: data.startDate.toDate(),
                    endDate: data.endDate.toDate(),
                    tasks: data.tasks.map((task: any) => ({
                        ...task,
                        startDate: task.startDate?.toDate ? task.startDate.toDate() : new Date(task.startDate),
                        endDate: task.endDate?.toDate ? task.endDate.toDate() : new Date(task.endDate),
                    }))
                } as Project;
            });
        } catch (error) {
            console.error("Error fetching projects:", error);
            return [];
        }
    },

    // Create a new project from Wizard Data
    async createProject(data: ProjectData): Promise<void> {
        try {
            // Transform ProjectData to Project model
            const newProject = {
                name: data.title || data.description || "Untitled Project",
                // Default values for fields not in ProjectData but required by Project model
                taskCount: 0,
                progress: 0,
                startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : Timestamp.fromDate(new Date()),
                endDate: data.deadlineDate ? Timestamp.fromDate(new Date(data.deadlineDate)) : (data.targetDate ? Timestamp.fromDate(new Date(data.targetDate)) : Timestamp.fromDate(new Date())),
                status: (data.status as any) || "planned",
                priority: (data.priority as any) || "medium",
                tags: data.tags || [],
                members: data.contributorIds,
                client: "",
                typeLabel: data.intent || "Project",
                durationLabel: "",
                tasks: data.addStarterTasks ? [
                    {
                        id: crypto.randomUUID(),
                        name: "Kickoff meeting",
                        assignee: "Team",
                        status: "todo",
                        startDate: Timestamp.fromDate(new Date()),
                        endDate: Timestamp.fromDate(new Date())
                    }
                ] : []
            };

            await addDoc(collection(db, COLLECTION_NAME), newProject);
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    },

    // Seed database with mock data
    async seedProjects(): Promise<void> {
        try {
            const batch = writeBatch(db);

            mockProjects.forEach(project => {
                const docRef = doc(collection(db, COLLECTION_NAME)); // Auto-ID
                const firestoreData = {
                    ...project,
                    startDate: Timestamp.fromDate(project.startDate),
                    endDate: Timestamp.fromDate(project.endDate),
                    tasks: project.tasks.map(t => ({
                        ...t,
                        startDate: Timestamp.fromDate(t.startDate),
                        endDate: Timestamp.fromDate(t.endDate)
                    }))
                };
                // Remove ID from data as it's the doc ID
                const { id, ...dataToSave } = firestoreData;
                batch.set(docRef, dataToSave);
            });

            await batch.commit();
            console.log("Seeding complete!");
        } catch (error) {
            console.error("Error seeding projects:", error);
            throw error;
        }
    }
};


"use server";

import { writeBatch, collection, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { brands, models, services } from "@/lib/db/data";
import { Brand, Model, Service } from "./db/types";

export async function seedDatabase() {
    console.log("Checking database for seeding...");
    
    try {
        const batch = writeBatch(db);
        let changesMade = false;

        // --- Brands Seeding ---
        const brandsCollection = collection(db, "brands");
        const brandsSnapshot = await getDocs(brandsCollection);
        if (brandsSnapshot.empty) {
            changesMade = true;
            brands.forEach((brand: Brand) => {
                const docRef = doc(brandsCollection, brand.id);
                const { id, ...brandData } = brand;
                batch.set(docRef, brandData);
            });
            console.log("Brands queued for seeding.");
        }

        // --- Services Seeding ---
        const servicesCollection = collection(db, "services");
        const servicesSnapshot = await getDocs(servicesCollection);
        if (servicesSnapshot.empty) {
            changesMade = true;
            services.forEach((service: Service) => {
                const docRef = doc(servicesCollection, service.id);
                const { id, ...serviceData } = service;
                const cleanService = JSON.parse(JSON.stringify(serviceData));
                batch.set(docRef, cleanService);
            });
            console.log("Services queued for seeding.");
        }
        
        // --- Models Seeding (with sync logic) ---
        const modelsCollection = collection(db, "models");
        const modelsSnapshot = await getDocs(modelsCollection);
        const existingModelIds = new Set(modelsSnapshot.docs.map(d => d.id));
        const localModelIds = new Set(models.map(m => m.id));

        // Add or update models from local data file
        for (const model of models) {
            const docRef = doc(modelsCollection, model.id);
            const { id, ...modelData } = model;
            // Always set/update to ensure data is fresh.
            // This also adds new models not present in Firestore.
            batch.set(docRef, modelData);
        }
        
        // Find models in Firestore that are no longer in the local data file and delete them
        const modelsToDelete = modelsSnapshot.docs.filter(doc => !localModelIds.has(doc.id));

        if (modelsToDelete.length > 0) {
            changesMade = true;
            console.log(`Found ${modelsToDelete.length} models to delete.`);
            modelsToDelete.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        const existingModelsMap = new Map(modelsSnapshot.docs.map(d => [d.id, d.data()]));
        let contentChanged = false;
        if (existingModelIds.size !== localModelIds.size) {
            contentChanged = true;
        } else {
            for (const model of models) {
              const existingModelData = existingModelsMap.get(model.id);
              // A simple check to see if an existing model has changed.
              if (!existingModelData || JSON.stringify({id: model.id, ...model}) !== JSON.stringify({ id: model.id, ...existingModelData })) {
                contentChanged = true;
                break;
              }
            }
        }
        
        // A change is either a new/deleted model or modified content.
        if (changesMade || contentChanged) {
            await batch.commit();
            console.log("Database seed/sync completed successfully!");
        } else {
            console.log("Database is up to date. No seeding required.");
        }

        return { success: true, message: "Database check/seed completed." };
    } catch (error) {
        console.error("Error seeding database:", error);
        return { success: false, message: "Error seeding database." };
    }
}

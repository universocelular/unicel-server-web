
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Model } from "@/lib/db/types";

// Firestore collection reference
const modelsCollectionRef = collection(db, "models");

export async function getModels(): Promise<Model[]> {
    const querySnapshot = await getDocs(modelsCollectionRef);
    const models: Model[] = [];
    querySnapshot.forEach((doc) => {
        models.push({ id: doc.id, ...doc.data() } as Model);
    });
    return models;
}

export async function getModelById(id: string): Promise<Model | undefined> {
    const modelDoc = doc(db, "models", id);
    const docSnap = await getDoc(modelDoc);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Model;
    }
    return undefined;
}

export async function addModel(data: Omit<Model, 'id'>): Promise<Model> {
  const docRef = await addDoc(modelsCollectionRef, data);
  revalidatePath("/admin/brands");
  revalidatePath("/");
  return { id: docRef.id, ...data };
}

export async function updateModel(id: string, data: Partial<Omit<Model, 'id'>>): Promise<Model | null> {
    const modelDoc = doc(db, "models", id);
    
    // Firestore disallows undefined values. We need to clean the data object.
    const cleanData = JSON.parse(JSON.stringify(data));

    await updateDoc(modelDoc, cleanData);

    revalidatePath("/admin/brands");
    revalidatePath("/admin/prices");
    revalidatePath("/");

    const updatedDoc = await getDoc(modelDoc);
    if (updatedDoc.exists()) {
        return { id: updatedDoc.id, ...updatedDoc.data() } as Model;
    }
    return null;
}

export async function deleteModel(id: string): Promise<void> {
  const modelDoc = doc(db, "models", id);
  await deleteDoc(modelDoc);
  revalidatePath("/admin/brands");
  revalidatePath("/");
  return Promise.resolve();
}

export async function updatePricesInBatch(modelIds: string[], serviceOrSubServiceId: string, newPrice: number): Promise<void> {
    if (modelIds.length === 0) {
        throw new Error("No model IDs provided for batch update.");
    }

    const batch = writeBatch(db);

    modelIds.forEach(id => {
        const modelRef = doc(db, "models", id);
        // This will now correctly target both services and sub-services by their ID.
        const fieldToUpdate = `priceOverrides.${serviceOrSubServiceId}`;
        batch.update(modelRef, { [fieldToUpdate]: newPrice });
    });

    await batch.commit();
    revalidatePath("/admin/prices");
}

export async function setAllPricesUnderConstruction(): Promise<void> {
    const querySnapshot = await getDocs(modelsCollectionRef);
    if (querySnapshot.empty) {
        return;
    }

    const batch = writeBatch(db);

    querySnapshot.forEach(modelDoc => {
        batch.update(modelDoc.ref, { priceOverrides: null });
    });

    await batch.commit();
    revalidatePath("/admin/prices");
    revalidatePath('/model', 'layout');
}

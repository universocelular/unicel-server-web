
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Brand } from "@/lib/db/types";

// Firestore collection reference
const brandsCollectionRef = collection(db, "brands");
const modelsCollectionRef = collection(db, "models");


export async function getBrands(): Promise<Brand[]> {
  const querySnapshot = await getDocs(brandsCollectionRef);
  const brands: Brand[] = [];
  querySnapshot.forEach((doc) => {
    brands.push({ id: doc.id, ...doc.data() } as Brand);
  });
  // Sort by name for consistent ordering
  return brands.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addBrand(name: string): Promise<Brand> {
  const docRef = await addDoc(brandsCollectionRef, { name });
  revalidatePath("/admin/brands");
  return { id: docRef.id, name };
}

export async function updateBrand(id: string, name: string): Promise<Brand | null> {
  const brandDoc = doc(db, "brands", id);
  await updateDoc(brandDoc, { name });
  revalidatePath("/admin/brands");
  return { id, name };
}

export async function deleteBrand(id: string): Promise<void> {
    const brandDocRef = doc(db, "brands", id);
    const brandSnapshot = await getDoc(brandDocRef);
    if (!brandSnapshot.exists()) {
        console.error("Brand not found for deletion");
        return;
    }
    const brandName = brandSnapshot.data().name;

    const batch = writeBatch(db);

    // Find all models associated with the brand to be deleted
    const modelsQuery = query(modelsCollectionRef, where("brand", "==", brandName));
    const modelsSnapshot = await getDocs(modelsQuery);

    // Add deletions for each associated model to the batch
    modelsSnapshot.forEach((modelDoc) => {
        batch.delete(modelDoc.ref);
    });

    // Add the brand deletion to the batch
    batch.delete(brandDocRef);

    // Commit all deletions at once
    await batch.commit();

    // Revalidate paths to update the UI across the app
    revalidatePath("/admin/brands");
    revalidatePath("/");
}

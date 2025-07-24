
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Popup } from "@/lib/db/types";

// Firestore collection reference
const popupsCollectionRef = collection(db, "popups");

export async function getPopups(): Promise<Popup[]> {
  const querySnapshot = await getDocs(popupsCollectionRef);
  const popups: Popup[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    // Ensure description is an array for backward compatibility
    if (typeof data.description === 'string') {
        data.description = [data.description];
    }
    popups.push({ id: doc.id, ...data } as Popup);
  });
  return popups;
}

export async function addPopup(data: Partial<Omit<Popup, 'id'>>): Promise<Popup> {
  const cleanData = JSON.parse(JSON.stringify(data));
  const docRef = await addDoc(popupsCollectionRef, cleanData);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
  return { id: docRef.id, ...cleanData } as Popup;
}

export async function updatePopup(id: string, data: Partial<Omit<Popup, 'id'>>): Promise<void> {
  const popupDoc = doc(db, "popups", id);
  const cleanData = JSON.parse(JSON.stringify(data));
  
  await updateDoc(popupDoc, cleanData);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
}

export async function deletePopup(id: string): Promise<void> {
  const popupDoc = doc(db, "popups", id);
  await deleteDoc(popupDoc);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
}


export async function duplicatePopup(id: string): Promise<void> {
    const originalPopupDocRef = doc(db, "popups", id);
    const docSnap = await getDoc(originalPopupDocRef);

    if (!docSnap.exists()) {
        throw new Error("Popup to duplicate not found");
    }

    const originalData = docSnap.data();
    
    // Ensure the title exists before trying to modify it
    const newTitle = originalData.title ? `[COPIA] ${originalData.title}` : "[COPIA]";
    
    const duplicatedData = {
        ...originalData,
        title: newTitle,
        isActive: false 
    };

    await addDoc(popupsCollectionRef, duplicatedData);

    revalidatePath("/admin/popups");
}

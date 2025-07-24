
"use server";

import { revalidatePath } from "next/cache";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Settings } from "@/lib/db/types";

const settingsDocRef = doc(db, "settings", "global");

export async function getSettings(): Promise<Settings> {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
        return docSnap.data() as Settings;
    }
    // Return default settings if document doesn't exist
    return {
        isDiscountModeActive: false,
        discounts: [],
        isFreeModeActive: false,
        freeServices: [],
        usdToArsRate: 1340, // Default rate
    };
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
    const docSnap = await getDoc(settingsDocRef);
    const cleanData = JSON.parse(JSON.stringify(data));

    if (docSnap.exists()) {
        await updateDoc(settingsDocRef, cleanData);
    } else {
        // If the document doesn't exist, create it with the new data.
        await setDoc(settingsDocRef, cleanData);
    }

    // Revalidate paths to ensure UI updates across the admin panel
    revalidatePath("/admin/discount-mode");
    revalidatePath("/admin/free-mode");
    revalidatePath("/admin/prices");
    revalidatePath("/admin");
    // Revalidate pricing pages as they might be affected
    revalidatePath('/model', 'layout');

    const newSettings = await getDoc(settingsDocRef);
    return newSettings.data() as Settings;
}

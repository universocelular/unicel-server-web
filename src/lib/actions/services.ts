
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Service } from "@/lib/db/types";
import { v4 as uuidv4 } from 'uuid';


// Firestore collection reference
const servicesCollectionRef = collection(db, "services");

export async function uploadImageAndGetURL(imageFile: File): Promise<string> {
    const fileExtension = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `services/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
}

export async function getServices(): Promise<Service[]> {
    const querySnapshot = await getDocs(servicesCollectionRef);
    const services: Service[] = [];
    querySnapshot.forEach((doc) => {
        services.push({ id: doc.id, ...doc.data() } as Service);
    });
    return services;
}

export async function getServiceById(id: string): Promise<Service | undefined> {
    const serviceDoc = doc(db, "services", id);
    const docSnap = await getDoc(serviceDoc);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Service;
    }
    return undefined;
}

export async function addService(data: Omit<Service, 'id' | 'description' > & { description?: string }): Promise<Service> {
  const serviceData = {
      ...data,
      description: data.description || "",
  };
  const docRef = await addDoc(servicesCollectionRef, serviceData);
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${docRef.id}`);
  return { id: docRef.id, ...serviceData };
}

export async function updateService(id: string, data: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  const serviceDoc = doc(db, "services", id);
  // Firestore doesn't like `undefined` values. Let's clean the data.
  const cleanData = JSON.parse(JSON.stringify(data));
  await updateDoc(serviceDoc, cleanData);

  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  const updatedDoc = await getDoc(serviceDoc);
  if (updatedDoc.exists()){
      return { id: updatedDoc.id, ...updatedDoc.data() } as Service;
  }
  return null;
}

export async function deleteService(id: string): Promise<void> {
  const serviceDoc = doc(db, "services", id);
  await deleteDoc(serviceDoc);
  revalidatePath("/admin/services");
  return Promise.resolve();
}

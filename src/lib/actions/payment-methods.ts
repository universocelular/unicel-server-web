
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PaymentMethod } from "@/lib/db/types";

const paymentMethodsCollectionRef = collection(db, "payment-methods");

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const querySnapshot = await getDocs(paymentMethodsCollectionRef);
  const methods: PaymentMethod[] = [];
  querySnapshot.forEach((doc) => {
    methods.push({ id: doc.id, ...doc.data() } as PaymentMethod);
  });
  return methods.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addPaymentMethod(data: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
  const docRef = await addDoc(paymentMethodsCollectionRef, data);
  revalidatePath("/admin/payment-methods");
  return { id: docRef.id, ...data };
}

export async function updatePaymentMethod(id: string, data: Partial<Omit<PaymentMethod, 'id'>>): Promise<void> {
  const methodDoc = doc(db, "payment-methods", id);
  await updateDoc(methodDoc, data);
  revalidatePath("/admin/payment-methods");
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const methodDoc = doc(db, "payment-methods", id);
  await deleteDoc(methodDoc);
  revalidatePath("/admin/payment-methods");
}

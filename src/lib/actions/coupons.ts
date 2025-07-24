
"use server";

import { revalidatePath } from "next/cache";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Coupon } from "@/lib/db/types";

// Firestore collection reference
const couponsCollectionRef = collection(db, "coupons");

export async function getCoupons(): Promise<Coupon[]> {
  const querySnapshot = await getDocs(couponsCollectionRef);
  const coupons: Coupon[] = [];
  querySnapshot.forEach((doc) => {
    coupons.push({ id: doc.id, ...doc.data() } as Coupon);
  });
  return coupons;
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    const q = query(couponsCollectionRef, where("code", "==", code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Coupon;
}


export async function addCoupon(data: Omit<Coupon, 'id'>): Promise<Coupon> {
  const couponData = {
    ...data,
    code: data.code.toUpperCase(), // Ensure code is uppercase
  };
  const docRef = await addDoc(couponsCollectionRef, couponData);
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
  return { id: docRef.id, ...couponData };
}

export async function updateCoupon(id: string, data: Partial<Omit<Coupon, 'id'>>): Promise<void> {
  const couponDoc = doc(db, "coupons", id);
  const dataToUpdate = { ...data };
  if (data.code) {
      dataToUpdate.code = data.code.toUpperCase();
  }
  const cleanData = JSON.parse(JSON.stringify(dataToUpdate));
  await updateDoc(couponDoc, cleanData);
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
}

export async function deleteCoupon(id: string): Promise<void> {
  const couponDoc = doc(db, "coupons", id);
  await deleteDoc(couponDoc);
  revalidatePath("/admin/coupons");
  revalidatePath("/admin");
}

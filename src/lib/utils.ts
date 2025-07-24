import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Model, Service } from "./db/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Service IDs based on detailed user request
const IPHONE_SERVICES = ['7', '8', '9', '4']; // iCloud, MDM, IMEI Report, SIM Unlock
const APPLE_OTHER_SERVICES = ['7', '8']; // iCloud, MDM (for iPad, Watch, Mac)
const HUAWEI_SERVICES = ['1', '2', '3', '4', '5']; // Google, IMEI, Payjoy, SIM, Huawei ID
const XIAOMI_SERVICES = ['1', '2', '3', '4', '6']; // Google, IMEI, Payjoy, SIM, Xiaomi ID
const ANDROID_DEFAULT_SERVICES = ['1', '2', '3', '4']; // Google, IMEI, Payjoy, SIM

export function getApplicableServices(model: Model, allServices: Service[]): Service[] {
  let serviceIds: string[] = [];

  if (model.brand === 'Apple') {
    if (model.category === 'Phone') { // iPhone
        serviceIds = IPHONE_SERVICES;
    } else { // Mac, iPad, Watch
        serviceIds = APPLE_OTHER_SERVICES;
    }
  } else if (model.brand === 'Huawei') {
    serviceIds = HUAWEI_SERVICES;
  } else if (model.brand === 'Xiaomi') {
    serviceIds = XIAOMI_SERVICES;
  } else {
    // Default for other Android brands (Samsung, Google, OnePlus, Motorola, etc.)
    serviceIds = ANDROID_DEFAULT_SERVICES;
  }
  
  // Return services in the order defined by the serviceIds array
  return serviceIds.map(id => allServices.find(s => s.id === id)).filter((s): s is Service => !!s);
}

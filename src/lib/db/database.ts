// This file is no longer needed as we are moving to Firestore.
// The logic has been moved to src/lib/actions/*.ts files which interact with Firestore.
// The initial data is now in src/lib/db/data.ts and is seeded into Firestore
// via src/lib/seed-db.ts.

// Keeping the file to avoid breaking imports in other parts of the app during transition,
// but its functions should no longer be used.

import type { Brand, Model, Service } from './types';
import { 
    brands as initialBrands, 
    models as initialModels, 
    services as initialServices 
} from './data';

// This singleton is no longer the source of truth.
// Firestore is the source of truth.
const db = {
  brands: [...initialBrands],
  models: [...initialModels],
  services: [...initialServices],
};

export function getBrandsDB(): Brand[] {
  console.warn("DEPRECATED: getBrandsDB is called. Should use Firestore actions.");
  return db.brands;
}

export function getModelsDB(): Model[] {
  console.warn("DEPRECATED: getModelsDB is called. Should use Firestore actions.");
  return db.models;
}

export function getServicesDB(): Service[] {
  console.warn("DEPRECATED: getServicesDB is called. Should use Firestore actions.");
  return db.services;
}

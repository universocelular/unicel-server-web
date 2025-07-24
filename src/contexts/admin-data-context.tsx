
"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Brand, Model, Service } from '@/lib/db/types';
import { getBrands } from '@/lib/actions/brands';
import { getModels } from '@/lib/actions/models';
import { getServices } from '@/lib/actions/services';

interface AdminDataContextType {
  brands: Brand[];
  models: Model[];
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
  services: Service[];
  refreshData: () => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ 
    children,
    initialBrands,
    initialModels,
    initialServices
}: { 
    children: ReactNode;
    initialBrands: Brand[];
    initialModels: Model[];
    initialServices: Service[];
}) {
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [models, setModels] = useState<Model[]>(initialModels);
  const [services, setServices] = useState<Service[]>(initialServices);

  const refreshData = useCallback(async () => {
    // This function will re-fetch all the data and update the state.
    // This can be called by child components after they perform a mutation.
    const [newBrands, newModels, newServices] = await Promise.all([
      getBrands(),
      getModels(),
      getServices(),
    ]);
    setBrands(newBrands);
    setModels(newModels);
    setServices(newServices);
  }, []);

  const value = { brands, models, setModels, services, refreshData };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}

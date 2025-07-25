"use client";

import { useEffect, useState } from 'react';
import { notFound } from "next/navigation";

import { getServiceById } from "@/lib/actions/services";
import { ServiceDetailClient } from "@/components/admin/service-detail-client";
import type { Service } from '@/lib/db/types';
import { Skeleton } from '../ui/skeleton';

export function ServiceDetailPage({ serviceId }: { serviceId: string }) {
  const [service, setService] = useState<Service | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        const fetchedService = await getServiceById(serviceId);
        setService(fetchedService);
      } catch (error) {
        console.error("Failed to fetch service:", error);
        setService(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchService();
  }, [serviceId]);

  if (isLoading) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  if (!service) {
    notFound();
  }

  return <ServiceDetailClient initialService={service} />;
}
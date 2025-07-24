"use client";

import { useState, useEffect, memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { countries } from "@/lib/db/data";
import type { Brand, Model, Service, Coupon, Settings } from "@/lib/db/types";
import { Skeleton } from "../ui/skeleton";

interface Stat {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

interface DashboardClientProps {
    initialBrands: Brand[];
    initialModels: Model[];
    initialServices: Service[];
    initialCoupons: Coupon[];
    initialSettings: Settings;
}

const ActiveIndicator = memo(({ text }: { text: string }) => (
    <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>{text}</span>
    </div>
));
ActiveIndicator.displayName = 'ActiveIndicator';

const StatCard = memo(({ stat }: { stat: Stat }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {stat.title}
            </CardTitle>
            {stat.icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                {stat.value}
            </div>
        </CardContent>
    </Card>
));
StatCard.displayName = 'StatCard';

export function DashboardClient({
    initialBrands,
    initialModels,
    initialServices,
    initialCoupons,
    initialSettings,
}: DashboardClientProps) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let finalStats: Stat[] = [
        { title: "Marcas Totales", value: initialBrands.length, icon: <span className="text-2xl">🏷️</span> },
        { title: "Modelos Totales", value: initialModels.length, icon: <span className="text-2xl">📱</span> },
        { title: "Servicios Totales", value: initialServices.length, icon: <span className="text-2xl">🔧</span> },
        { title: "Países Activos", value: countries.length, icon: <span className="text-2xl">🌍</span> },
        { title: "Cupones Activos", value: initialCoupons.filter(c => c.isActive).length, icon: <span className="text-2xl">🎟️</span> },
        { title: "Modo Descuento", value: initialSettings.isDiscountModeActive ? <ActiveIndicator text={`${initialSettings.discounts?.filter(d => d.isActive).length || 0} reglas`} /> : 'Desactivado', icon: <span className="text-2xl">💯</span> },
        { title: "Modo Gratis", value: initialSettings.isFreeModeActive ? <ActiveIndicator text="Activado" /> : 'Desactivado', icon: <span className="text-2xl">🎁</span> },
        { title: "Servicios en Modo Gratis", value: initialSettings.freeServices?.length || 0, icon: <span className="text-2xl">🆓</span> }
    ];

    setStats(finalStats);
    setLoading(false);
  }, [initialBrands, initialModels, initialServices, initialCoupons, initialSettings]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/40">
      <div className="grid gap-4">
        <h1 className="font-semibold text-3xl">Visión General</h1>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
               <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
              <StatCard key={stat.title} stat={stat} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

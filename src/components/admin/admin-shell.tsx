
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandIcon } from "@/components/icons";

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "text-primary bg-muted"
      )}
    >
      {children}
    </Link>
  );
};

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BrandIcon className="h-16 w-16 text-foreground" />
              <span className="">Unicel Server</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink href="/admin">
                <span>🏠</span>
                Visión General
              </NavLink>
              <NavLink href="/admin/brands">
                <span>🏷️</span>
                Marcas y Modelos
              </NavLink>
              <NavLink href="/admin/services">
                <span>🔧</span>
                Servicios
              </NavLink>
              <NavLink href="/admin/prices">
                <span>💵</span>
                Precios
              </NavLink>
               <NavLink href="/admin/payment-methods">
                <span>💳</span>
                Medios de Pago
              </NavLink>
              <NavLink href="/admin/discount-mode">
                <span>💯</span>
                Modo Descuento
              </NavLink>
              <NavLink href="/admin/free-mode">
                <span>🎁</span>
                Modo Gratis
              </NavLink>
              <NavLink href="/admin/coupons">
                <span>🎟️</span>
                Cupones
              </NavLink>
              <NavLink href="/admin/popups">
                <span>📢</span>
                Pop-ups
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto p-4">
            
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <MobileNav />
             <div className="w-full flex-1">
                 {/* You can add a search bar here if needed */}
             </div>
             <div className="hidden md:block">
                <ThemeToggle />
             </div>
        </header>
        <div className="flex-1 overflow-auto">
            {children}
        </div>
      </div>
    </div>
  );
}

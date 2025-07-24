
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BrandIcon } from "../icons";

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </Link>
  );
};


export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold mb-4"
          >
            <BrandIcon className="h-16 w-16 text-foreground" />
            <span className="">Unicel Server</span>
          </Link>
          <MobileNavLink href="/admin">
            <span>🏠</span>
            Visión General
          </MobileNavLink>
          <MobileNavLink href="/admin/brands">
            <span>🏷️</span>
            Marcas y Modelos
          </MobileNavLink>
          <MobileNavLink href="/admin/services">
            <span>🔧</span>
            Servicios
          </MobileNavLink>
           <MobileNavLink href="/admin/prices">
            <span>💵</span>
            Precios
          </MobileNavLink>
          <MobileNavLink href="/admin/payment-methods">
            <span>💳</span>
             Medios de Pago
          </MobileNavLink>
          <MobileNavLink href="/admin/discount-mode">
            <span>💯</span>
            Modo Descuento
          </MobileNavLink>
          <MobileNavLink href="/admin/free-mode">
            <span>🎁</span>
            Modo Gratis
          </MobileNavLink>
          <MobileNavLink href="/admin/coupons">
            <span>🎟️</span>
            Cupones
          </MobileNavLink>
          <MobileNavLink href="/admin/popups">
            <span>📢</span>
            Pop-ups
          </MobileNavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

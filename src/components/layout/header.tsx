
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandIcon } from "@/components/icons";

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <BrandIcon className="h-10 w-10 text-foreground" />
          <span className="hidden sm:inline-block text-base font-bold tracking-tight text-foreground">Unicel Server</span>
        </Link>
        
        <div className="flex-1">
          {/* This space is intentionally left blank now */}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="icon">
              <span className="text-2xl">⚙️</span>
              <span className="sr-only">Admin Login</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

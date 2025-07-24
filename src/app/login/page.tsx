"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { BrandIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simple validation simulation
    if (email === "unicel@admin" && password === "Unicel_@admin2026") {
      toast({
        title: "Acceso Concedido",
        description: "Redirigiendo al panel...",
      });
      setTimeout(() => router.push("/admin"), 1000);
    } else {
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: "Email o contraseña inválidos.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background p-4">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="grid gap-2 text-center">
             <Link href="/" className="flex flex-col items-center justify-center gap-2 mb-4">
              <BrandIcon className="h-40 w-40 text-foreground" />
              <h1 className="text-3xl font-bold tracking-tight">Unicel Server</h1>
            </Link>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4 mt-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Accediendo..." : "Acceder"}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>
    </div>
  );
}

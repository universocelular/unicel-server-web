import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalLoader } from "@/components/layout/global-loader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: 'swap',
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: 'swap',
});


export const metadata: Metadata = {
  title: "Unicel Server",
  description: "Servicios de desbloqueo de móviles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
       <head>
        <link rel="preload" href="/_next/static/media/20b72c86162a78f3-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/_next/static/media/3c3b0a7044414a92-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${caveat.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <GlobalLoader />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buck",
  description: "Buck V1 Application",
  icons: {
    icon: "/buck.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextTopLoader 
          color="hsl(203.8863 88.2845% 53.1373%)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

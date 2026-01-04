import type { Metadata } from "next";
import { ResponsiveToaster } from "@/components/ui/responsive-toaster";
import NextTopLoader from "nextjs-toploader";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";
import '@vidstack/react/player/styles/base.css';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('buck-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress Vidstack errors globally
              window.addEventListener('error', function(event) {
                const msg = event.error?.message || event.message || '';
                if (msg.includes('$state') || msg.includes('prop2') || 
                    msg.includes('orientation.lock') || msg.includes('NotSupportedError')) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              }, true);
              
              window.addEventListener('unhandledrejection', function(event) {
                const msg = event.reason?.message || String(event.reason) || '';
                if (msg.includes('$state') || msg.includes('prop2') || 
                    msg.includes('orientation.lock') || msg.includes('NotSupportedError')) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }, true);
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProvider>
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
          <ResponsiveToaster />
        </SessionProvider>
      </body>
    </html>
  );
}

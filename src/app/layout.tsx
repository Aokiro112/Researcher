'use client';

import React, { useState } from 'react';
import './globals.css';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { AuthModal } from '@/components/modals/AuthModal';
import { PricingModal } from '@/components/modals/PricingModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{ title?: string; subtitle?: string }>({});

  const handleOpenAuth = (title?: string, subtitle?: string) => {
    setAuthModalConfig({ title, subtitle });
    setIsAuthOpen(true);
  };

  return (
    <html lang="en">
      <head>
        <title>Perplexity</title>
        <meta name="description" content="Where knowledge begins" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
        {/* Responsive Desktop Sidebar */}
        <AppSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          onOpenAuth={() => handleOpenAuth()}
          onOpenPlans={() => setIsPlansOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
          {children}
        </main>

        {/* Global Modals */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          title={authModalConfig.title}
          subtitle={authModalConfig.subtitle}
        />

        <PricingModal
          isOpen={isPlansOpen}
          onClose={() => setIsPlansOpen(false)}
        />
      </body>
    </html>
  );
}

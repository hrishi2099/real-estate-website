"use client";

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { OfficeSettings } from '@prisma/client';

interface LayoutWrapperProps {
  children: React.ReactNode;
  settings: Pick<OfficeSettings, 'companyName' | 'logoUrl' | 'phone' | 'email'> | null;
}

export default function LayoutWrapper({
  children,
  settings,
}: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header settings={settings} />}
      <main>{children}</main>
      {!isAdminPage && <Footer settings={settings} />}
      {settings?.phone && !isAdminPage && <WhatsAppButton settings={settings} />}
    </>
  );
}
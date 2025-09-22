"use client";

import ContactPopup from './ContactPopup';
import { useContactPopup } from '@/hooks/useContactPopup';

interface Settings {
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  mondayHours?: string | null;
  tuesdayHours?: string | null;
  wednesdayHours?: string | null;
  thursdayHours?: string | null;
  fridayHours?: string | null;
  saturdayHours?: string | null;
  sundayHours?: string | null;
}

interface ContactPopupWrapperProps {
  settings?: Settings | null;
}

export default function ContactPopupWrapper({ settings }: ContactPopupWrapperProps) {
  const { isOpen, closePopup } = useContactPopup();

  return <ContactPopup isOpen={isOpen} onClose={closePopup} settings={settings} />;
}
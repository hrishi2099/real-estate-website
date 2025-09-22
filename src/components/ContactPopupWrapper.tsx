"use client";

import ContactPopup from './ContactPopup';
import { useContactPopup } from '@/hooks/useContactPopup';

export default function ContactPopupWrapper() {
  const { isOpen, closePopup } = useContactPopup();

  return <ContactPopup isOpen={isOpen} onClose={closePopup} />;
}
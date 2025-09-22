"use client";

import { useState, useEffect } from 'react';

export function useContactPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem('contactPopupShown');

    if (!popupShown && !hasShown) {
      // Show popup after 3 seconds delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('contactPopupShown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasShown]);

  const openPopup = () => {
    setIsOpen(true);
    setHasShown(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openPopup,
    closePopup
  };
}
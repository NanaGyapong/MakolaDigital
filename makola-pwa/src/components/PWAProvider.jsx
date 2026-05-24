// components/PWAProvider.jsx
"use client";
import { useEffect } from "react";
import { useServiceWorker, useOnlineStatus } from "@/hooks/usePWA";
import { InstallBanner, UpdateBanner, OfflineBanner } from "./InstallBanner";

export default function PWAProvider({ children }) {
  const { updateAvailable, applyUpdate, registration, swStatus } = useServiceWorker();
  const { isOnline } = useOnlineStatus();

  // Register periodic sync for listing updates
  useEffect(() => {
    if (!registration || !("periodicSync" in registration)) return;
    registration.periodicSync.register("update-listings", {
      minInterval: 24 * 60 * 60 * 1000, // once per day
    }).catch(() => {});
  }, [registration]);

  return (
    <>
      {children}
      <OfflineBanner isOnline={isOnline} />
      {updateAvailable && <UpdateBanner onUpdate={applyUpdate} />}
      <InstallBanner />
    </>
  );
}

// hooks/usePWA.js
// Comprehensive PWA hook — install prompt, update detection, online status,
// push notifications, background sync

"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── useInstallPrompt ──────────────────────────────────────────
// Captures the beforeinstallprompt event for custom install UI
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // Capture install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Detect successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return { outcome: "no-prompt" };
    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
      return { outcome };
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt]);

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isInstalling,
    promptInstall,
  };
}

// ── useServiceWorker ──────────────────────────────────────────
// Registers SW and detects updates
export function useServiceWorker() {
  const [registration, setRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swStatus, setSwStatus] = useState("idle"); // idle | registering | active | error
  const newWorkerRef = useRef(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    setSwStatus("registering");

    navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then((reg) => {
        setRegistration(reg);
        setSwStatus("active");
        console.log("[PWA] Service worker registered:", reg.scope);

        // Check for updates on registration
        reg.update();

        // Listen for new SW waiting
        const checkForUpdate = () => {
          if (reg.waiting) {
            newWorkerRef.current = reg.waiting;
            setUpdateAvailable(true);
          }
        };

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorkerRef.current = newWorker;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        checkForUpdate();

        // Check for updates every 30 minutes
        const interval = setInterval(() => reg.update(), 30 * 60 * 1000);
        return () => clearInterval(interval);
      })
      .catch(err => {
        console.error("[PWA] SW registration failed:", err);
        setSwStatus("error");
      });

    // Reload page when SW activates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = useCallback(() => {
    newWorkerRef.current?.postMessage({ type: "SKIP_WAITING" });
    setUpdateAvailable(false);
  }, []);

  const sendMessage = useCallback((message) => {
    registration?.active?.postMessage(message);
  }, [registration]);

  return { registration, updateAvailable, swStatus, applyUpdate, sendMessage };
}

// ── useOnlineStatus ───────────────────────────────────────────
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [connectionType, setConnectionType] = useState(null);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    // Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType);
      connection.addEventListener("change", () => setConnectionType(connection.effectiveType));
    }

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}

// ── usePushNotifications ──────────────────────────────────────
export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscription, setSubscription] = useState(null);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "unsupported";

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribe = useCallback(async (registration) => {
    if (!registration || permission !== "granted") return null;

    try {
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) { setSubscription(existingSub); return existingSub; }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      });

      setSubscription(sub);

      // Send subscription to server
      await fetch("/api/v1/notifications/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("makola_token")}` },
        body: JSON.stringify(sub),
      });

      return sub;
    } catch (err) {
      console.error("[PWA] Push subscription failed:", err);
      return null;
    }
  }, [permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    await subscription.unsubscribe();
    setSubscription(null);

    await fetch("/api/v1/notifications/push-unsubscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("makola_token")}` },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }, [subscription]);

  return { permission, subscription, requestPermission, subscribe, unsubscribe };
}

// ── useBackgroundSync ─────────────────────────────────────────
export function useBackgroundSync(registration) {
  const registerSync = useCallback(async (tag) => {
    if (!registration || !("sync" in registration)) return false;
    try {
      await registration.sync.register(tag);
      return true;
    } catch { return false; }
  }, [registration]);

  return { registerSync };
}

// ── useShareTarget ────────────────────────────────────────────
// Handle shared content (Web Share Target API)
export function useShareTarget() {
  const [sharedContent, setSharedContent] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const title = url.searchParams.get("title");
    const text  = url.searchParams.get("text");
    const sharedUrl = url.searchParams.get("url");

    if (title || text || sharedUrl) {
      setSharedContent({ title, text, url: sharedUrl });
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return sharedContent;
}

// ── Helper ────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

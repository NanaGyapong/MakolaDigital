"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("makola_token");
      if (!token) {
        router.replace("/auth/login?redirect=/admin/dashboard");
        return;
      }
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data.role !== "admin") {
          router.replace("/");
          return;
        }
        setAuthenticated(true);
      } catch {
        router.replace("/auth/login?redirect=/admin/dashboard");
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, []);

  if (checking) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0A0A0A" }}>
      <div style={{ color: "rgba(240,237,232,0.4)", fontSize: 14 }}>Verifying access...</div>
    </div>
  );

  if (!authenticated) return null;

  return <>{children}</>;
}

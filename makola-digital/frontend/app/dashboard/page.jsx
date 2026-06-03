"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/dashboard/analytics");
  }, [router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0A0A0A", color: "#E8533A" }}>
      <p>Loading dashboard...</p>
    </div>
  );
}

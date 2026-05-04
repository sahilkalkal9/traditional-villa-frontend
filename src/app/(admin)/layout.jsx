"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f4ec] text-[#071726]">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f4ec]">
      <Toaster position="top-right" />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="min-w-0 flex-1">
        <Topbar setSidebarOpen={setSidebarOpen} />
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
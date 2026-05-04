"use client";

import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar({ setSidebarOpen }) {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#eadcc5] bg-[#f8f4ec]/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl border border-[#eadcc5] p-2 lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div>
            <h2 className="text-base font-semibold text-[#071726] sm:text-lg">
              Admin Panel
            </h2>
            <p className="hidden text-xs text-[#6b7280] sm:block">
              Manage bookings, payments, expenses and reports
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-2xl bg-[#071726] px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
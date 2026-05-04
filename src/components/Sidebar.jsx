"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  WalletCards,
  X,
} from "lucide-react";

const logoUrl =
  "https://ik.imagekit.io/fkhvlkpi1/ChatGPT_Image_May_4__2026__06_15_02_AM-removebg-preview.png";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bookings", href: "/bookings", icon: ReceiptText },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Expenses", href: "/expenses", icon: WalletCards },
];

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] bg-[#071726] p-4 text-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#b8862b]/60 bg-white/10">
              <Image
                src={logoUrl}
                alt="The Traditional Villa"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <h1 className="text-sm font-semibold leading-tight">
                The Traditional
              </h1>
              <p className="text-xs tracking-[0.28em] text-[#f3d78d]">VILLA</p>
            </div>
          </div>

          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-[#b8862b] text-white shadow-lg"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
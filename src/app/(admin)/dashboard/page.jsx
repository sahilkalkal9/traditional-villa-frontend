"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import api from "@/utils/api";
import StatCard from "@/components/StatCard";
import toast from "react-hot-toast";

const formatMoney = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      setStats(data.stats);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-[#071726]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-gradient-to-br from-[#071726] to-[#102b45] p-5 text-white shadow-xl sm:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-[#f3d78d]">The Traditional Villa</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              High level booking, payment, expense and profit/loss summary.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs text-white/60">Profit / Loss</p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                Number(stats?.profitLoss || 0) >= 0
                  ? "text-[#f3d78d]"
                  : "text-red-300"
              }`}
            >
              {formatMoney(stats?.profitLoss)}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatMoney(stats?.totalRevenue)}
          sub="Booking final amount"
        />
        <StatCard
          title="Paid Amount"
          value={formatMoney(stats?.paidAmount)}
          sub="Actual received amount"
        />
        <StatCard
          title="Pending Amount"
          value={formatMoney(stats?.pendingAmount)}
          sub="Amount yet to collect"
        />
        <StatCard
          title="Total Expenses"
          value={formatMoney(stats?.totalExpenses)}
          sub="All categories combined"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <CalendarCheck className="text-[#b8862b]" size={24} />
          <p className="mt-4 text-sm text-[#6b7280]">Total Bookings</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#071726]">
            {stats?.totalBookings || 0}
          </h3>
        </div>

        <div className="card p-5">
          <CalendarClock className="text-[#b8862b]" size={24} />
          <p className="mt-4 text-sm text-[#6b7280]">Upcoming Bookings</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#071726]">
            {stats?.upcomingBookings || 0}
          </h3>
        </div>

        <div className="card p-5">
          <IndianRupee className="text-[#b8862b]" size={24} />
          <p className="mt-4 text-sm text-[#6b7280]">Pending Payments</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#071726]">
            {stats?.pendingPayments || 0}
          </h3>
        </div>

        <div className="card p-5">
          <TrendingUp className="text-[#b8862b]" size={24} />
          <p className="mt-4 text-sm text-[#6b7280]">Cash Flow</p>
          <h3 className="mt-1 text-2xl font-semibold text-[#071726]">
            {formatMoney(stats?.cashFlow)}
          </h3>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[#071726]">
            Expense Breakdown
          </h2>

          <div className="mt-5 space-y-4">
            {[
              ["Rent", stats?.rentExpense],
              ["Electricity", stats?.electricityExpense],
              ["Salary", stats?.salaryExpense],
              ["Other Expenses", stats?.otherExpenses],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-[#fffaf2] p-4"
              >
                <span className="text-sm text-[#6b7280]">{label}</span>
                <span className="font-semibold text-[#071726]">
                  {formatMoney(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-[#071726]">
            Business Summary
          </h2>

          <div className="mt-5 rounded-3xl bg-[#071726] p-5 text-white">
            <p className="text-sm text-white/60">Formula</p>
            <p className="mt-2 text-lg font-semibold text-[#f3d78d]">
              Revenue - Expenses = Profit / Loss
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span>{formatMoney(stats?.totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span>{formatMoney(stats?.totalExpenses)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
                <span>Net P&L</span>
                <span>{formatMoney(stats?.profitLoss)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
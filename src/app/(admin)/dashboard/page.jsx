"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const logoutAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.error("Session expired. Please login again.");
    router.replace("/login");
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/dashboard");
      setStats(data?.stats || {});
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        logoutAndRedirect();
        return;
      }

      toast.error(error?.response?.data?.message || "Dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] w-full px-3 py-4 sm:px-5">
        <div className="rounded-2xl bg-white p-4 text-sm font-medium text-[#071726] shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-2 py-3 sm:space-y-6 sm:px-4 sm:py-5 lg:px-0 lg:py-0">
      <section className="w-full rounded-[20px] bg-gradient-to-br from-[#071726] to-[#102b45] p-4 text-white shadow-xl sm:rounded-[28px] sm:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#f3d78d] sm:text-sm">
              The Traditional Villa
            </p>

            <h1 className="mt-2 break-words text-xl font-semibold leading-tight sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/70 sm:text-sm">
              High level booking, payment, expense and profit/loss summary.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 sm:w-auto sm:min-w-[210px] sm:rounded-3xl">
            <p className="text-xs text-white/60">Profit / Loss</p>

            <p
              className={`mt-1 break-words text-xl font-semibold leading-tight sm:text-2xl ${
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

      <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
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

      <section className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <DashboardInfoCard
          icon={CalendarCheck}
          label="Total Bookings"
          value={stats?.totalBookings || 0}
        />

        <DashboardInfoCard
          icon={CalendarClock}
          label="Upcoming Bookings"
          value={stats?.upcomingBookings || 0}
        />

        <DashboardInfoCard
          icon={IndianRupee}
          label="Pending Payments"
          value={stats?.pendingPayments || 0}
        />

        <DashboardInfoCard
          icon={TrendingUp}
          label="Cash Flow"
          value={formatMoney(stats?.cashFlow)}
        />
      </section>

      <section className="grid w-full grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="card min-w-0 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-[#071726] sm:text-lg">
            Expense Breakdown
          </h2>

          <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
            {[
              ["Rent", stats?.rentExpense],
              ["Electricity", stats?.electricityExpense],
              ["Salary", stats?.salaryExpense],
              ["Other Expenses", stats?.otherExpenses],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-2xl bg-[#fffaf2] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <span className="text-xs text-[#6b7280] sm:text-sm">
                  {label}
                </span>

                <span className="break-words text-sm font-semibold text-[#071726] sm:text-base">
                  {formatMoney(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card min-w-0 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-[#071726] sm:text-lg">
            Business Summary
          </h2>

          <div className="mt-4 rounded-2xl bg-[#071726] p-4 text-white sm:mt-5 sm:rounded-3xl sm:p-5">
            <p className="text-xs text-white/60 sm:text-sm">Formula</p>

            <p className="mt-2 text-base font-semibold leading-snug text-[#f3d78d] sm:text-lg">
              Revenue - Expenses = Profit / Loss
            </p>

            <div className="mt-5 space-y-3 text-xs sm:text-sm">
              <SummaryRow
                label="Total Revenue"
                value={formatMoney(stats?.totalRevenue)}
              />

              <SummaryRow
                label="Total Expenses"
                value={formatMoney(stats?.totalExpenses)}
              />

              <div className="flex items-start justify-between gap-3 border-t border-white/10 pt-3 font-semibold">
                <span className="min-w-0">Net P&amp;L</span>
                <span className="break-words text-right">
                  {formatMoney(stats?.profitLoss)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DashboardInfoCard({ icon: Icon, label, value }) {
  return (
    <div className="card min-w-0 p-4 sm:p-5">
      <Icon className="text-[#b8862b]" size={22} />

      <p className="mt-4 text-xs text-[#6b7280] sm:text-sm">{label}</p>

      <h3 className="mt-1 break-words text-xl font-semibold leading-tight text-[#071726] sm:text-2xl">
        {value}
      </h3>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="min-w-0 text-white/80">{label}</span>
      <span className="break-words text-right font-medium">{value}</span>
    </div>
  );
}
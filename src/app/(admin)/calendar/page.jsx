"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/calendar", {
        params: { month, year },
      });

      setCalendar(data.calendar || {});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Calendar load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [month, year]);

  const days = useMemo(() => {
    const totalDays = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const blanks = Array.from({ length: firstDay }, () => null);
    const dates = Array.from({ length: totalDays }, (_, i) => i + 1);

    return [...blanks, ...dates];
  }, [month, year]);

  const dateKey = (day) => {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-[#071726] p-5 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[#f3d78d]">The Traditional Villa</p>
          <h1 className="mt-1 text-2xl font-semibold">Booking Calendar</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex">
          <select
            className="input bg-white text-[#071726]"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="input bg-white text-[#071726]"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-4 flex flex-wrap gap-3 text-xs">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            Available
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
            Booked
          </span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
            Partial Payment
          </span>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[#6b7280]">
            Loading calendar...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#6b7280]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="min-h-24" />;
                }

                const key = dateKey(day);
                const bookings = calendar[key] || [];
                const isBooked = bookings.length > 0;
                const hasPartial = bookings.some(
                  (b) => b.paymentStatus === "partial"
                );

                return (
                  <div
                    key={key}
                    className={`min-h-24 rounded-2xl border p-2 text-xs transition sm:min-h-32 ${
                      isBooked
                        ? hasPartial
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-red-200 bg-red-50"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-[#071726]">
                        {day}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          isBooked
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isBooked ? "Booked" : "Free"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {bookings.slice(0, 2).map((booking) => (
                        <div
                          key={booking.bookingId}
                          className="rounded-xl bg-white/80 p-2 shadow-sm"
                        >
                          <p className="truncate font-semibold text-[#071726]">
                            {booking.guest}
                          </p>
                          <p className="truncate text-[11px] text-[#6b7280]">
                            {booking.phone}
                          </p>
                          <p className="mt-1 text-[10px] capitalize text-[#b8862b]">
                            {booking.paymentStatus}
                          </p>
                        </div>
                      ))}

                      {bookings.length > 2 && (
                        <p className="text-[11px] font-semibold text-[#071726]">
                          +{bookings.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
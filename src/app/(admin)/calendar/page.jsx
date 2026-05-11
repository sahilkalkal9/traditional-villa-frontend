"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const emptyGuest = {
  name: "",
  age: "",
  gender: "",
  idType: "",
  idNumber: "",
  isMainPerson: false,
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const getInitialForm = (date = new Date()) => {
  const checkInDate = formatDateKey(date);
  const checkOut = new Date(date);
  checkOut.setDate(checkOut.getDate() + 1);

  return {
    mainPersonName: "",
    phone: "",
    alternatePhone: "",
    guests: [{ ...emptyGuest, isMainPerson: true }],
    checkInDate,
    checkOutDate: formatDateKey(checkOut),
    totalGuests: 1,
    adults: 1,
    children: 0,
    pricePerDay: "",
    discount: 0,
    advancePaid: 0,
    paymentMode: "upi",
    bookingSource: "direct",
    notes: "",
  };
};

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const Label = ({ children, dark = false }) => (
  <label
    className={`mb-1.5 block text-[11px] font-semibold uppercase tracking-wide sm:text-xs ${
      dark ? "text-white/60" : "text-[#6b7280]"
    }`}
  >
    {children}
  </label>
);

const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const getStartOfWeek = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
};

const getMonthGridDays = (year, monthIndex) => {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startDay = new Date(firstDayOfMonth);

  startDay.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + index);
    return date;
  });
};

const getWeekDays = (selectedDate) => {
  const start = getStartOfWeek(selectedDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const getDateStatus = (bookings = []) => {
  if (!bookings.length) {
    return {
      label: "Free",
      className: "bg-green-100 text-green-700",
      boxClass: "bg-white hover:bg-green-50",
      eventClass: "bg-green-100 text-green-700",
    };
  }

  const hasPartial = bookings.some((b) => b.paymentStatus === "partial");

  if (hasPartial) {
    return {
      label: "Partial",
      className: "bg-yellow-100 text-yellow-700",
      boxClass: "bg-yellow-50 hover:bg-yellow-100/70",
      eventClass: "bg-yellow-100 text-yellow-800",
    };
  }

  return {
    label: "Booked",
    className: "bg-red-100 text-red-700",
    boxClass: "bg-red-50 hover:bg-red-100/70",
    eventClass: "bg-red-100 text-red-800",
  };
};

export default function CalendarPage() {
  const router = useRouter();

  const today = useMemo(() => new Date(), []);

  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState("month");
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(getInitialForm(today));

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const logoutAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.error("Session expired. Please login again.");
    router.replace("/login");
  };

  const handleApiError = (error, fallbackMessage) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      logoutAndRedirect();
      return true;
    }

    toast.error(error?.response?.data?.message || fallbackMessage);
    return false;
  };

  const fetchCalendar = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/calendar", {
        params: {
          month,
          year,
        },
      });

      setCalendar(data.calendar || {});
    } catch (error) {
      handleApiError(error, "Calendar load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const monthDays = useMemo(() => {
    return getMonthGridDays(year, selectedDate.getMonth());
  }, [year, selectedDate]);

  const currentWeekDays = useMemo(() => {
    return getWeekDays(selectedDate);
  }, [selectedDate]);

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedDateBookings = calendar[selectedDateKey] || [];
  const selectedStatus = getDateStatus(selectedDateBookings);

  const movePrevious = () => {
    setSelectedDate((prev) => {
      const next = new Date(prev);

      if (view === "month") next.setMonth(next.getMonth() - 1);
      if (view === "week") next.setDate(next.getDate() - 7);
      if (view === "day") next.setDate(next.getDate() - 1);

      return next;
    });
  };

  const moveNext = () => {
    setSelectedDate((prev) => {
      const next = new Date(prev);

      if (view === "month") next.setMonth(next.getMonth() + 1);
      if (view === "week") next.setDate(next.getDate() + 7);
      if (view === "day") next.setDate(next.getDate() + 1);

      return next;
    });
  };

  const goToday = () => {
    setSelectedDate(new Date());
  };

  const handleMonthChange = (value) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setMonth(Number(value) - 1);
      return next;
    });
  };

  const handleYearChange = (value) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(Number(value) || new Date().getFullYear());
      return next;
    });
  };

  const openDayView = (date) => {
    setSelectedDate(new Date(date));
    setView("day");
  };

  const openAddModal = (date = selectedDate) => {
    setForm(getInitialForm(date));
    setModalOpen(true);
  };

  const openViewModal = async (booking) => {
    try {
      setDetailsLoading(true);
      setSelectedBooking(booking);
      setViewModalOpen(true);

      if (!booking?.bookingId) return;

      const { data } = await api.get(`/bookings/${booking.bookingId}`);
      setSelectedBooking(data.booking || data.data || booking);
    } catch (error) {
      handleApiError(error, "Booking details load failed");
    } finally {
      setDetailsLoading(false);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!bookingId) {
      toast.error("Booking id missing");
      return;
    }

    const ok = window.confirm("Booking delete karni hai?");
    if (!ok) return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success("Booking deleted");
      fetchCalendar();
    } catch (error) {
      handleApiError(error, "Delete failed");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuestChange = (index, field, value) => {
    setForm((prev) => {
      const updatedGuests = [...prev.guests];

      updatedGuests[index] = {
        ...updatedGuests[index],
        [field]: value,
      };

      return {
        ...prev,
        guests: updatedGuests,
        totalGuests: updatedGuests.length,
      };
    });
  };

  const addGuest = () => {
    setForm((prev) => ({
      ...prev,
      guests: [...prev.guests, { ...emptyGuest }],
      totalGuests: prev.guests.length + 1,
    }));
  };

  const removeGuest = (index) => {
    if (form.guests.length === 1) {
      toast.error("At least one guest required");
      return;
    }

    setForm((prev) => {
      const updatedGuests = prev.guests.filter((_, i) => i !== index);

      if (!updatedGuests.some((g) => g.isMainPerson)) {
        updatedGuests[0].isMainPerson = true;
      }

      return {
        ...prev,
        guests: updatedGuests,
        totalGuests: updatedGuests.length,
      };
    });
  };

  const setMainGuest = (index) => {
    setForm((prev) => {
      const updatedGuests = prev.guests.map((guest, i) => ({
        ...guest,
        isMainPerson: i === index,
      }));

      const mainGuest = updatedGuests[index];

      return {
        ...prev,
        guests: updatedGuests,
        mainPersonName: mainGuest.name || prev.mainPersonName,
      };
    });
  };

  const saveBooking = async (e) => {
    e.preventDefault();

    if (
      !form.mainPersonName ||
      !form.phone ||
      !form.checkInDate ||
      !form.checkOutDate
    ) {
      toast.error("Required fields fill kar bro");
      return;
    }

    const validGuests = form.guests.filter((guest) => guest.name.trim());

    if (validGuests.length === 0) {
      toast.error("At least one guest detail required");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        guests: validGuests,
        totalGuests: validGuests.length,
      };

      await api.post("/bookings", payload);

      toast.success("Booking added");
      setModalOpen(false);
      fetchCalendar();
    } catch (error) {
      handleApiError(error, "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = useMemo(() => {
    if (view === "month") {
      return `${months[selectedDate.getMonth()]} ${year}`;
    }

    if (view === "week") {
      const start = currentWeekDays[0];
      const end = currentWeekDays[6];

      return `${start.getDate()} ${
        months[start.getMonth()]
      } - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
    }

    return `${selectedDate.getDate()} ${
      months[selectedDate.getMonth()]
    } ${selectedDate.getFullYear()}`;
  }, [view, selectedDate, year, currentWeekDays]);

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 px-2 py-3 sm:space-y-5 sm:px-4 lg:px-0 lg:py-0">
      <div className="rounded-[20px] bg-[#071726] p-4 text-white sm:rounded-[28px] sm:p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#f3d78d] sm:text-sm">
              The Traditional Villa
            </p>

            <h1 className="mt-1 text-xl font-semibold leading-tight sm:text-2xl">
              Booking Calendar
            </h1>

            <p className="mt-2 break-words text-sm text-white/60">
              {headerTitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            <div>
              <Label dark>Month</Label>
              <select
                className="input bg-white text-sm text-[#071726]"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
              >
                {months.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label dark>Year</Label>
              <input
                type="number"
                className="input bg-white text-sm text-[#071726]"
                value={year}
                onChange={(e) => handleYearChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid grid-cols-3 rounded-2xl bg-white/10 p-1 text-xs font-semibold sm:w-fit sm:text-sm">
            {["month", "week", "day"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setView(item)}
                className={`rounded-xl px-3 py-2 capitalize transition ${
                  view === item
                    ? "bg-[#b8862b] text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[44px_1fr_44px] gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={movePrevious}
              className="flex h-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={goToday}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#071726]"
            >
              Today
            </button>

            <button
              type="button"
              onClick={moveNext}
              className="flex h-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#eadcc5] bg-[#fffaf2] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="shrink-0 text-[#b8862b]" size={18} />
            <p className="break-words text-sm font-semibold text-[#071726]">
              {headerTitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
            <span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700">
              Free
            </span>
            <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
              Booked
            </span>
            <span className="rounded-full bg-yellow-100 px-2.5 py-1 font-semibold text-yellow-700">
              Partial
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center gap-2 text-sm text-[#6b7280]">
            <Loader2 className="animate-spin" size={18} />
            Loading calendar...
          </div>
        ) : (
          <>
            {view === "month" && (
              <MonthView
                days={monthDays}
                selectedDate={selectedDate}
                currentMonth={selectedDate.getMonth()}
                calendar={calendar}
                today={today}
                onSelectDate={openDayView}
              />
            )}

            {view === "week" && (
              <WeekView
                days={currentWeekDays}
                selectedDate={selectedDate}
                calendar={calendar}
                today={today}
                onSelectDate={openDayView}
              />
            )}

            {view === "day" && (
              <DayView
                selectedDate={selectedDate}
                bookings={selectedDateBookings}
                today={today}
                status={selectedStatus}
                onAddBooking={() => openAddModal(selectedDate)}
                onViewBooking={openViewModal}
                onDeleteBooking={deleteBooking}
              />
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <AddBookingModal
          form={form}
          saving={saving}
          setForm={setForm}
          onClose={() => setModalOpen(false)}
          onSubmit={saveBooking}
          handleChange={handleChange}
          handleGuestChange={handleGuestChange}
          addGuest={addGuest}
          removeGuest={removeGuest}
          setMainGuest={setMainGuest}
        />
      )}

      {viewModalOpen && selectedBooking && (
        <ViewBookingModal
          booking={selectedBooking}
          loading={detailsLoading}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
}

function MonthView({
  days,
  selectedDate,
  currentMonth,
  calendar,
  today,
  onSelectDate,
}) {
  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#eadcc5] bg-white text-center text-[9px] font-semibold uppercase text-[#6b7280] min-[360px]:text-[10px] sm:text-xs">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r border-[#eadcc5] py-2 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {days.map((date) => {
          const key = formatDateKey(date);
          const bookings = calendar[key] || [];
          const status = getDateStatus(bookings);
          const isCurrentMonth = date.getMonth() === currentMonth;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(new Date(date))}
              className={`min-h-[88px] min-w-0 border-r border-b border-[#eadcc5] p-1 text-left transition last:border-r-0 sm:min-h-[126px] sm:p-2 lg:min-h-[145px] ${
                status.boxClass
              } ${isSelected ? "ring-2 ring-inset ring-[#b8862b]" : ""} ${
                !isCurrentMonth ? "opacity-45" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col items-start gap-1">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold sm:h-7 sm:w-7 sm:text-xs ${
                    isToday
                      ? "bg-[#b8862b] text-white"
                      : isSelected
                      ? "bg-[#071726] text-white"
                      : "text-[#071726]"
                  }`}
                >
                  {date.getDate()}
                </span>

                <span
                  className={`block max-w-full truncate rounded-full px-1.5 py-0.5 text-[8px] font-semibold leading-tight min-[360px]:text-[9px] sm:px-2 sm:text-[10px] ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-1 space-y-1 sm:mt-2">
                {bookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking.bookingId}
                    className={`truncate rounded px-1 py-1 text-[9px] font-semibold min-[360px]:px-1.5 min-[360px]:text-[10px] sm:text-[11px] ${status.eventClass}`}
                    title={booking.guest}
                  >
                    {booking.guest || "Booked"}
                  </div>
                ))}

                {bookings.length > 2 && (
                  <p className="truncate text-[9px] font-semibold text-[#6b7280] min-[360px]:text-[10px]">
                    +{bookings.length - 2} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ days, selectedDate, calendar, today, onSelectDate }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#eadcc5] bg-white text-center">
        {days.map((date) => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={formatDateKey(date)}
              type="button"
              onClick={() => onSelectDate(new Date(date))}
              className={`min-w-0 border-r border-[#eadcc5] px-1 py-2 last:border-r-0 ${
                isSelected ? "bg-[#fff3d8]" : "bg-white"
              }`}
            >
              <p className="text-[9px] font-semibold uppercase text-[#6b7280] min-[360px]:text-[10px] sm:text-xs">
                {weekDays[date.getDay()]}
              </p>

              <span
                className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  isToday
                    ? "bg-[#b8862b] text-white"
                    : isSelected
                    ? "bg-[#071726] text-white"
                    : "text-[#071726]"
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {days.map((date) => {
          const key = formatDateKey(date);
          const bookings = calendar[key] || [];
          const status = getDateStatus(bookings);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(new Date(date))}
              className={`min-h-[230px] min-w-0 border-r border-b border-[#eadcc5] p-1 text-left last:border-r-0 sm:min-h-[300px] sm:p-2 ${
                status.boxClass
              } ${isSelected ? "ring-2 ring-inset ring-[#b8862b]" : ""}`}
            >
              <span
                className={`mb-2 block max-w-full truncate rounded-full px-1.5 py-1 text-[8px] font-semibold min-[360px]:text-[9px] sm:inline-flex sm:px-2 sm:text-[10px] ${status.className}`}
              >
                {status.label}
              </span>

              <div className="space-y-1">
                {bookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className={`rounded px-1 py-1.5 text-[9px] font-semibold min-[360px]:text-[10px] sm:px-1.5 sm:text-xs ${status.eventClass}`}
                  >
                    <p className="truncate">{booking.guest || "Booked"}</p>
                    <p className="hidden truncate font-normal opacity-80 sm:block">
                      {booking.phone}
                    </p>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayView({
  selectedDate,
  bookings,
  today,
  status,
  onAddBooking,
  onViewBooking,
  onDeleteBooking,
}) {
  const isToday = isSameDay(selectedDate, today);

  return (
    <div className="bg-white">
      <div className="border-b border-[#eadcc5] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${
              isToday
                ? "bg-[#b8862b] text-white"
                : "bg-[#fffaf2] text-[#071726]"
            }`}
          >
            {selectedDate.getDate()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-sm font-semibold text-[#071726]">
                {weekDays[selectedDate.getDay()]},{" "}
                {months[selectedDate.getMonth()]} {selectedDate.getDate()}
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#6b7280]">
              {bookings.length > 0
                ? `${bookings.length} booking found`
                : "No booking found"}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[280px] p-3 sm:p-4">
        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-700">
              This date is free.
            </p>

            <p className="mt-1 text-xs text-green-700/80">
              Add a booking directly for this date.
            </p>

            <button
              type="button"
              onClick={onAddBooking}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071726] px-4 py-3 text-sm font-semibold text-white sm:w-auto"
            >
              <Plus size={17} />
              Add Booking
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const cardStatus = getDateStatus([booking]);

              return (
                <div
                  key={booking.bookingId}
                  className={`rounded-3xl border p-4 ${
                    booking.paymentStatus === "partial"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-semibold text-[#071726]">
                          {booking.guest || "Booked Guest"}
                        </p>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${cardStatus.className}`}
                        >
                          {cardStatus.label}
                        </span>
                      </div>

                      <p className="mt-1 break-words text-sm text-[#6b7280]">
                        {booking.phone || "-"}
                      </p>

                      <p className="mt-2 text-xs capitalize text-[#6b7280]">
                        Payment: {booking.paymentStatus || "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => onViewBooking(booking)}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#071726]"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteBooking(booking.bookingId)}
                        className="flex items-center justify-center rounded-2xl bg-red-100 px-4 py-2.5 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AddBookingModal({
  form,
  saving,
  setForm,
  onClose,
  onSubmit,
  handleChange,
  handleGuestChange,
  addGuest,
  removeGuest,
  setMainGuest,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black/50 p-2 sm:items-center sm:justify-center sm:p-3">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-[24px] bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#071726] sm:text-xl">
            Add Booking
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#fffaf2] p-2 text-[#071726]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div>
              <Label>Main Person Name</Label>
              <input
                name="mainPersonName"
                value={form.mainPersonName}
                onChange={handleChange}
                className="input text-sm"
                placeholder="Main person name"
              />
            </div>

            <div>
              <Label>Phone Number</Label>
              <input
                name="phone"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    phone: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="input text-sm"
                placeholder="Phone number"
                inputMode="numeric"
              />
            </div>

            <div>
              <Label>Alternate Phone</Label>
              <input
                name="alternatePhone"
                maxLength={10}
                value={form.alternatePhone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    alternatePhone: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="input text-sm"
                placeholder="Alternate phone"
                inputMode="numeric"
              />
            </div>

            <div>
              <Label>Booking Source</Label>
              <select
                name="bookingSource"
                value={form.bookingSource}
                onChange={handleChange}
                className="input text-sm"
              >
                <option value="direct">Direct</option>
                <option value="airbnb">Airbnb</option>
                <option value="makemytrip">MakeMyTrip</option>
                <option value="booking_com">Booking.com</option>
                <option value="instagram">Instagram</option>
                <option value="reference">Reference</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label>Check-In Date</Label>
              <input
                type="date"
                name="checkInDate"
                value={form.checkInDate}
                onChange={handleChange}
                className="input text-sm"
              />
            </div>

            <div>
              <Label>Check-Out Date</Label>
              <input
                type="date"
                name="checkOutDate"
                value={form.checkOutDate}
                onChange={handleChange}
                className="input text-sm"
              />
            </div>

            <div>
              <Label>Adults</Label>
              <input
                type="number"
                name="adults"
                value={form.adults}
                onChange={handleChange}
                className="input text-sm"
                min="0"
              />
            </div>

            <div>
              <Label>Children</Label>
              <input
                type="number"
                name="children"
                value={form.children}
                onChange={handleChange}
                className="input text-sm"
                min="0"
              />
            </div>

            <div>
              <Label>Price Per Day</Label>
              <input
                type="number"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                className="input text-sm"
                placeholder="Price per day"
                min="0"
              />
            </div>

            <div>
              <Label>Discount</Label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="input text-sm"
                min="0"
              />
            </div>

            <div>
              <Label>Advance Paid</Label>
              <input
                type="number"
                name="advancePaid"
                value={form.advancePaid}
                onChange={handleChange}
                className="input text-sm"
                min="0"
              />
            </div>

            <div>
              <Label>Payment Mode</Label>
              <select
                name="paymentMode"
                value={form.paymentMode}
                onChange={handleChange}
                className="input text-sm"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="online_platform">Online Platform</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-3 sm:p-4">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-semibold text-[#071726]">
                  Guest Details
                </h3>
                <p className="text-xs text-[#6b7280]">
                  Total guests: {form.guests.length}
                </p>
              </div>

              <button
                type="button"
                onClick={addGuest}
                className="w-full rounded-2xl bg-[#071726] px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
              >
                + Add Guest
              </button>
            </div>

            <div className="space-y-4">
              {form.guests.map((guest, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#eadcc5] bg-white p-3 sm:p-4"
                >
                  <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-sm font-semibold text-[#071726]">
                      Guest {index + 1} Details
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => setMainGuest(index)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          guest.isMainPerson
                            ? "bg-[#b8862b] text-white"
                            : "bg-[#fff3d8] text-[#9a6a16]"
                        }`}
                      >
                        Main
                      </button>

                      <button
                        type="button"
                        onClick={() => removeGuest(index)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                      <Label>Guest Name</Label>
                      <input
                        value={guest.name}
                        onChange={(e) =>
                          handleGuestChange(index, "name", e.target.value)
                        }
                        className="input text-sm"
                        placeholder="Guest name"
                      />
                    </div>

                    <div>
                      <Label>Age</Label>
                      <input
                        type="number"
                        value={guest.age}
                        onChange={(e) =>
                          handleGuestChange(index, "age", e.target.value)
                        }
                        className="input text-sm"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label>Gender</Label>
                      <select
                        value={guest.gender}
                        onChange={(e) =>
                          handleGuestChange(index, "gender", e.target.value)
                        }
                        className="input text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label>ID Type</Label>
                      <select
                        value={guest.idType}
                        onChange={(e) =>
                          handleGuestChange(index, "idType", e.target.value)
                        }
                        className="input text-sm"
                      >
                        <option value="">Select ID Type</option>
                        <option value="aadhaar">Aadhaar</option>
                        <option value="pan">PAN</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">
                          Driving License
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label>ID Number</Label>
                      <input
                        value={guest.idNumber}
                        onChange={(e) =>
                          handleGuestChange(index, "idNumber", e.target.value)
                        }
                        className="input text-sm"
                        placeholder="ID Number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input min-h-24 resize-none text-sm"
              placeholder="Notes"
            />
          </div>

          <button disabled={saving} className="btn-primary w-full">
            {saving ? "Saving..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ViewBookingModal({ booking, loading, onClose }) {
  const guests = booking.guests || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-black/50 p-2 sm:items-center sm:justify-center sm:p-3">
      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-[24px] bg-white p-4 shadow-2xl sm:rounded-[28px] sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#071726] sm:text-xl">
            Booking Details
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#fffaf2] p-2 text-[#071726]"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center gap-2 text-sm text-[#6b7280]">
            <Loader2 className="animate-spin" size={18} />
            Loading details...
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-[#071726] p-4 text-white sm:p-5 md:col-span-3">
              <p className="break-words text-sm text-[#f3d78d]">
                {booking.mainPersonName || booking.guest || "-"}
              </p>

              <h3 className="mt-1 break-words text-xl font-semibold sm:text-2xl">
                {money(booking.finalAmount)}
              </h3>

              <p className="mt-2 text-xs text-white/70 sm:text-sm">
                {booking.checkInDate?.slice?.(0, 10) || "-"} →{" "}
                {booking.checkOutDate?.slice?.(0, 10) || "-"}
              </p>
            </div>

            <Info label="Phone" value={booking.phone} />
            <Info
              label="Alternate Phone"
              value={booking.alternatePhone || "-"}
            />
            <Info label="Total Guests" value={booking.totalGuests} />
            <Info label="Adults" value={booking.adults} />
            <Info label="Children" value={booking.children} />
            <Info label="Nights" value={booking.numberOfNights || "-"} />
            <Info label="Price Per Day" value={money(booking.pricePerDay)} />
            <Info label="Total Rent" value={money(booking.totalRent)} />
            <Info label="Discount" value={money(booking.discount)} />
            <Info label="Advance Paid" value={money(booking.advancePaid)} />
            <Info label="Remaining" value={money(booking.remainingAmount)} />
            <Info
              label="Payment Mode"
              value={booking.paymentMode?.replaceAll?.("_", " ") || "-"}
            />

            <div className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-3 sm:p-4 md:col-span-3">
              <h3 className="mb-3 font-semibold text-[#071726]">
                Guest Members
              </h3>

              <div className="grid gap-3">
                {guests.map((guest, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white p-3 text-sm sm:p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-[#071726]">
                          {guest.name || "-"}{" "}
                          {guest.isMainPerson && (
                            <span className="ml-1 inline-flex rounded-full bg-[#b8862b] px-2 py-0.5 text-[10px] text-white">
                              Main
                            </span>
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#6b7280]">
                          Age: {guest.age || "-"} • Gender:{" "}
                          {guest.gender || "-"}
                        </p>
                      </div>

                      <div className="min-w-0 text-left sm:text-right">
                        <p className="text-xs text-[#6b7280]">ID Proof</p>
                        <p className="break-words capitalize text-[#071726]">
                          {guest.idType?.replaceAll?.("_", " ") || "-"}{" "}
                          {guest.idNumber ? `• ${guest.idNumber}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {guests.length === 0 && (
                  <p className="text-sm text-[#6b7280]">
                    No guest details added.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-[#eadcc5] bg-white p-4 md:col-span-3">
              <p className="text-xs text-[#6b7280]">Notes</p>
              <p className="mt-1 break-words text-sm text-[#071726]">
                {booking.notes || "-"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 break-words font-semibold capitalize text-[#071726]">
        {value || "-"}
      </p>
    </div>
  );
}
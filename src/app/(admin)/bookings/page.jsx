"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const emptyGuest = {
  name: "",
  age: "",
  gender: "",
  idType: "",
  idNumber: "",
  isMainPerson: false,
};

const initialForm = {
  mainPersonName: "",
  phone: "",
  alternatePhone: "",
  guests: [{ ...emptyGuest, isMainPerson: true }],
  checkInDate: "",
  checkOutDate: "",
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

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const Label = ({ children }) => (
  <label className="mb-1.5 block text-xs font-semibold text-[#6b7280]">
    {children}
  </label>
);

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [filters, setFilters] = useState({
    search: "",
    from: "",
    to: "",
    paymentStatus: "",
    bookingStatus: "",
    type: "",
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const { data } = await api.get("/bookings", { params });
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Bookings load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const openAddModal = () => {
    setEditingBooking(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (booking) => {
    const guests =
      booking.guests?.length > 0
        ? booking.guests
        : [
            {
              name: booking.mainPersonName || "",
              age: "",
              gender: "",
              idType: "",
              idNumber: "",
              isMainPerson: true,
            },
          ];

    setEditingBooking(booking);

    setForm({
      mainPersonName: booking.mainPersonName || "",
      phone: booking.phone || "",
      alternatePhone: booking.alternatePhone || "",
      guests,
      checkInDate: booking.checkInDate?.slice(0, 10) || "",
      checkOutDate: booking.checkOutDate?.slice(0, 10) || "",
      totalGuests: booking.totalGuests || guests.length || 1,
      adults: booking.adults || 1,
      children: booking.children || 0,
      pricePerDay: booking.pricePerDay || "",
      discount: booking.discount || 0,
      advancePaid: booking.advancePaid || 0,
      paymentMode: booking.paymentMode || "upi",
      bookingSource: booking.bookingSource || "direct",
      notes: booking.notes || "",
    });

    setModalOpen(true);
  };

  const openViewModal = (booking) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
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

      if (editingBooking) {
        await api.put(`/bookings/${editingBooking._id}`, payload);
        toast.success("Booking updated");
      } else {
        await api.post("/bookings", payload);
        toast.success("Booking added");
      }

      setModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteBooking = async (id) => {
    const ok = window.confirm("Booking delete karni hai?");
    if (!ok) return;

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking deleted");
      fetchBookings();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const badge = (value) => {
    const cls =
      value === "paid" || value === "checked_out"
        ? "bg-green-100 text-green-700"
        : value === "partial" || value === "upcoming"
        ? "bg-yellow-100 text-yellow-700"
        : value === "cancelled" || value === "pending"
        ? "bg-red-100 text-red-700"
        : "bg-slate-100 text-slate-700";

    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
        {value?.replaceAll("_", " ") || "-"}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-[#071726] p-5 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[#f3d78d]">The Traditional Villa</p>
          <h1 className="mt-1 text-2xl font-semibold">Bookings</h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#b8862b] px-4 py-3 text-sm font-semibold"
        >
          <Plus size={18} />
          Add Booking
        </button>
      </div>

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#b8862b]" />
            <input
              className="input !pl-12"
              placeholder="Search name/phone"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
            />
          </div>

          <input
            type="date"
            className="input"
            value={filters.from}
            onChange={(e) =>
              setFilters((p) => ({ ...p, from: e.target.value }))
            }
          />

          <input
            type="date"
            className="input"
            value={filters.to}
            onChange={(e) =>
              setFilters((p) => ({ ...p, to: e.target.value }))
            }
          />

          <select
            className="input"
            value={filters.paymentStatus}
            onChange={(e) =>
              setFilters((p) => ({ ...p, paymentStatus: e.target.value }))
            }
          >
            <option value="">Payment</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>

          <button onClick={fetchBookings} className="btn-primary">
            Filter
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-[#fffaf2] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-5 py-4">Guest</th>
                <th className="px-5 py-4">Dates</th>
                <th className="px-5 py-4">Guests</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eadcc5]">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#071726]">
                      {b.mainPersonName}
                    </p>
                    <p className="text-xs text-[#6b7280]">{b.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-[#6b7280]">
                    {b.checkInDate?.slice(0, 10)} →{" "}
                    {b.checkOutDate?.slice(0, 10)}
                  </td>
                  <td className="px-5 py-4">{b.totalGuests}</td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{money(b.finalAmount)}</p>
                    <p className="text-xs text-[#6b7280]">
                      Pending {money(b.remainingAmount)}
                    </p>
                  </td>
                  <td className="px-5 py-4">{badge(b.paymentStatus)}</td>
                  <td className="px-5 py-4">{badge(b.bookingStatus)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openViewModal(b)}
                        className="rounded-xl border border-[#eadcc5] px-3 py-2 text-xs"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(b)}
                        className="rounded-xl border border-[#eadcc5] px-3 py-2 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBooking(b._id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && bookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[#6b7280]"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#071726]">
                    {b.mainPersonName}
                  </p>
                  <p className="text-xs text-[#6b7280]">{b.phone}</p>
                </div>
                {badge(b.paymentStatus)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#6b7280]">Check-in</p>
                  <p>{b.checkInDate?.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Check-out</p>
                  <p>{b.checkOutDate?.slice(0, 10)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Amount</p>
                  <p>{money(b.finalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Guests</p>
                  <p>{b.totalGuests}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => openViewModal(b)}
                  className="rounded-2xl border border-[#eadcc5] px-3 py-2 text-sm"
                >
                  View
                </button>
                <button
                  onClick={() => openEditModal(b)}
                  className="rounded-2xl bg-[#071726] px-3 py-2 text-sm text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteBooking(b._id)}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-red-600"
                >
                  <Trash2 className="mx-auto" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#071726]">
                {editingBooking ? "Edit Booking" : "Add Booking"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={saveBooking} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Main Person Name</Label>
                  <input
                    name="mainPersonName"
                    value={form.mainPersonName}
                    onChange={handleChange}
                    className="input"
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
                    className="input"
                    placeholder="Phone"
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
                    className="input"
                    placeholder="Alternate phone"
                  />
                </div>

                <div>
                  <Label>Booking Source</Label>
                  <select
                    name="bookingSource"
                    value={form.bookingSource}
                    onChange={handleChange}
                    className="input"
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
                    className="input"
                  />
                </div>

                <div>
                  <Label>Check-Out Date</Label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={form.checkOutDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <Label>Adults</Label>
                  <input
                    type="number"
                    name="adults"
                    value={form.adults}
                    onChange={handleChange}
                    className="input"
                    placeholder="Adults"
                  />
                </div>

                <div>
                  <Label>Children</Label>
                  <input
                    type="number"
                    name="children"
                    value={form.children}
                    onChange={handleChange}
                    className="input"
                    placeholder="Children"
                  />
                </div>

                <div>
                  <Label>Price Per Day</Label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={form.pricePerDay}
                    onChange={handleChange}
                    className="input"
                    placeholder="Price per day"
                  />
                </div>

                <div>
                  <Label>Discount</Label>
                  <input
                    type="number"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                    className="input"
                    placeholder="Discount"
                  />
                </div>

                <div>
                  <Label>Advance Paid</Label>
                  <input
                    type="number"
                    name="advancePaid"
                    value={form.advancePaid}
                    onChange={handleChange}
                    className="input"
                    placeholder="Advance paid"
                  />
                </div>

                <div>
                  <Label>Payment Mode</Label>
                  <select
                    name="paymentMode"
                    value={form.paymentMode}
                    onChange={handleChange}
                    className="input"
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

              <div className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4">
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
                    className="rounded-2xl bg-[#071726] px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Add Guest
                  </button>
                </div>

                <div className="space-y-4">
                  {form.guests.map((guest, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#eadcc5] bg-white p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#071726]">
                          Guest {index + 1} Details
                        </p>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setMainGuest(index)}
                            className={`rounded-xl px-3 py-1 text-xs font-semibold ${
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
                            className="rounded-xl bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
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
                            className="input"
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
                            className="input"
                            placeholder="Age"
                          />
                        </div>

                        <div>
                          <Label>Gender</Label>
                          <select
                            value={guest.gender}
                            onChange={(e) =>
                              handleGuestChange(
                                index,
                                "gender",
                                e.target.value
                              )
                            }
                            className="input"
                          >
                            <option value="">Gender</option>
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
                              handleGuestChange(
                                index,
                                "idType",
                                e.target.value
                              )
                            }
                            className="input"
                          >
                            <option value="">ID Type</option>
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
                              handleGuestChange(
                                index,
                                "idNumber",
                                e.target.value
                              )
                            }
                            className="input"
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
                  className="input min-h-24"
                  placeholder="Notes"
                />
              </div>

              <button disabled={saving} className="btn-primary w-full">
                {saving
                  ? "Saving..."
                  : editingBooking
                  ? "Update Booking"
                  : "Create Booking"}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[90] flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#071726]">
                Booking Details
              </h2>
              <button onClick={() => setViewModalOpen(false)}>
                <X />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-[#071726] p-5 text-white md:col-span-3">
                <p className="text-sm text-[#f3d78d]">
                  {selectedBooking.mainPersonName}
                </p>
                <h3 className="mt-1 text-2xl font-semibold">
                  {money(selectedBooking.finalAmount)}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {selectedBooking.checkInDate?.slice(0, 10)} →{" "}
                  {selectedBooking.checkOutDate?.slice(0, 10)}
                </p>
              </div>

              <Info label="Phone" value={selectedBooking.phone} />
              <Info
                label="Alternate Phone"
                value={selectedBooking.alternatePhone || "-"}
              />
              <Info label="Total Guests" value={selectedBooking.totalGuests} />
              <Info label="Adults" value={selectedBooking.adults} />
              <Info label="Children" value={selectedBooking.children} />
              <Info
                label="Nights"
                value={selectedBooking.numberOfNights || "-"}
              />
              <Info
                label="Price Per Day"
                value={money(selectedBooking.pricePerDay)}
              />
              <Info
                label="Total Rent"
                value={money(selectedBooking.totalRent)}
              />
              <Info label="Discount" value={money(selectedBooking.discount)} />
              <Info
                label="Advance Paid"
                value={money(selectedBooking.advancePaid)}
              />
              <Info
                label="Remaining"
                value={money(selectedBooking.remainingAmount)}
              />
              <Info
                label="Payment Mode"
                value={selectedBooking.paymentMode?.replaceAll("_", " ")}
              />

              <div className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4 md:col-span-3">
                <h3 className="mb-3 font-semibold text-[#071726]">
                  Guest Members
                </h3>

                <div className="grid gap-3">
                  {(selectedBooking.guests || []).map((guest, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-white p-4 text-sm"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <div>
                          <p className="font-semibold text-[#071726]">
                            {guest.name || "-"}{" "}
                            {guest.isMainPerson && (
                              <span className="ml-2 rounded-full bg-[#b8862b] px-2 py-0.5 text-[10px] text-white">
                                Main
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#6b7280]">
                            Age: {guest.age || "-"} • Gender:{" "}
                            {guest.gender || "-"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-[#6b7280]">ID Proof</p>
                          <p className="capitalize text-[#071726]">
                            {guest.idType?.replaceAll("_", " ") || "-"}{" "}
                            {guest.idNumber ? `• ${guest.idNumber}` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!selectedBooking.guests ||
                    selectedBooking.guests.length === 0) && (
                    <p className="text-sm text-[#6b7280]">
                      No guest details added.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[#eadcc5] bg-white p-4 md:col-span-3">
                <p className="text-xs text-[#6b7280]">Notes</p>
                <p className="mt-1 text-sm text-[#071726]">
                  {selectedBooking.notes || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 font-semibold capitalize text-[#071726]">
        {value || "-"}
      </p>
    </div>
  );
}
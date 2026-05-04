"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const initialForm = {
  category: "rent",
  title: "",
  amount: "",
  expenseDate: "",
  month: "",
  paymentMode: "upi",
  notes: "",
  landlordName: "",
  employeeName: "",
  employeeRole: "",
  monthlySalary: "",
  advanceTaken: "",
  electricityUnits: "",
};

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    month: "",
    from: "",
    to: "",
  });

  const fetchExpenses = async () => {
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => v && (params[k] = v));

      const { data } = await api.get("/expenses", { params });
      setExpenses(data.expenses || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Expenses load failed");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setForm({
      category: expense.category || "rent",
      title: expense.title || "",
      amount: expense.amount || "",
      expenseDate: expense.expenseDate?.slice(0, 10) || "",
      month: expense.month || "",
      paymentMode: expense.paymentMode || "upi",
      notes: expense.notes || "",
      landlordName: expense.landlordName || "",
      employeeName: expense.employeeName || "",
      employeeRole: expense.employeeRole || "",
      monthlySalary: expense.monthlySalary || "",
      advanceTaken: expense.advanceTaken || "",
      electricityUnits: expense.electricityUnits || "",
    });

    setModalOpen(true);
  };

  const saveExpense = async (e) => {
    e.preventDefault();

    if (!form.category || !form.title || !form.expenseDate || !form.month) {
      toast.error("Required fields fill kar bro");
      return;
    }

    try {
      setSaving(true);

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense._id}`, form);
        toast.success("Expense updated");
      } else {
        await api.post("/expenses", form);
        toast.success("Expense added");
      }

      setModalOpen(false);
      fetchExpenses();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Expense delete karna hai?")) return;

    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  const categoryBadge = (cat) => (
    <span className="rounded-full bg-[#fff3d8] px-3 py-1 text-xs font-semibold capitalize text-[#9a6a16]">
      {cat?.replaceAll("_", " ")}
    </span>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-[28px] bg-[#071726] p-5 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[#f3d78d]">The Traditional Villa</p>
          <h1 className="mt-1 text-2xl font-semibold">Expenses</h1>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#b8862b] px-4 py-3 text-sm font-semibold"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b8862b]" />
            <input
              className="input pl-11"
              placeholder="Search title/name"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
            />
          </div>

          <select
            className="input"
            value={filters.category}
            onChange={(e) =>
              setFilters((p) => ({ ...p, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            <option value="rent">Rent</option>
            <option value="electricity">Electricity</option>
            <option value="salary">Salary</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="food">Food</option>
            <option value="internet">Internet</option>
            <option value="laundry">Laundry</option>
            <option value="repair">Repair</option>
            <option value="other">Other</option>
          </select>

          <input
            className="input"
            placeholder="May 2026"
            value={filters.month}
            onChange={(e) =>
              setFilters((p) => ({ ...p, month: e.target.value }))
            }
          />

          <input
            type="date"
            className="input"
            value={filters.from}
            onChange={(e) =>
              setFilters((p) => ({ ...p, from: e.target.value }))
            }
          />

          <button onClick={fetchExpenses} className="btn-primary">
            Filter
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-[#fffaf2] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-5 py-4">Expense</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Month</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#eadcc5]">
              {expenses.map((e) => (
                <tr key={e._id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#071726]">{e.title}</p>
                    <p className="text-xs text-[#6b7280]">
                      {e.landlordName || e.employeeName || e.notes || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4">{categoryBadge(e.category)}</td>
                  <td className="px-5 py-4">{e.month}</td>
                  <td className="px-5 py-4">{e.expenseDate?.slice(0, 10)}</td>
                  <td className="px-5 py-4 capitalize">
                    {e.paymentMode?.replaceAll("_", " ")}
                  </td>
                  <td className="px-5 py-4 font-semibold">{money(e.amount)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(e)}
                        className="rounded-xl border border-[#eadcc5] px-3 py-2 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e._id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[#6b7280]"
                  >
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {expenses.map((e) => (
            <div
              key={e._id}
              className="rounded-3xl border border-[#eadcc5] bg-[#fffaf2] p-4"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#071726]">{e.title}</p>
                  <p className="text-xs text-[#6b7280]">{e.month}</p>
                </div>
                {categoryBadge(e.category)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#6b7280]">Amount</p>
                  <p>{money(e.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6b7280]">Date</p>
                  <p>{e.expenseDate?.slice(0, 10)}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEditModal(e)}
                  className="flex-1 rounded-2xl bg-[#071726] px-3 py-2 text-sm text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteExpense(e._id)}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end bg-black/50 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#071726]">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={saveExpense} className="grid gap-4 sm:grid-cols-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input"
              >
                <option value="rent">Rent</option>
                <option value="electricity">Electricity</option>
                <option value="salary">Salary</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="food">Food</option>
                <option value="internet">Internet</option>
                <option value="laundry">Laundry</option>
                <option value="repair">Repair</option>
                <option value="other">Other</option>
              </select>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="Expense title"
              />

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="input"
                placeholder="Amount"
              />

              <input
                type="date"
                name="expenseDate"
                value={form.expenseDate}
                onChange={handleChange}
                className="input"
              />

              <input
                name="month"
                value={form.month}
                onChange={handleChange}
                className="input"
                placeholder="May 2026"
              />

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
                <option value="other">Other</option>
              </select>

              {form.category === "rent" && (
                <input
                  name="landlordName"
                  value={form.landlordName}
                  onChange={handleChange}
                  className="input sm:col-span-2"
                  placeholder="Landlord name"
                />
              )}

              {form.category === "electricity" && (
                <input
                  type="number"
                  name="electricityUnits"
                  value={form.electricityUnits}
                  onChange={handleChange}
                  className="input sm:col-span-2"
                  placeholder="Electricity units"
                />
              )}

              {form.category === "salary" && (
                <>
                  <input
                    name="employeeName"
                    value={form.employeeName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Employee name"
                  />
                  <input
                    name="employeeRole"
                    value={form.employeeRole}
                    onChange={handleChange}
                    className="input"
                    placeholder="Employee role"
                  />
                  <input
                    type="number"
                    name="monthlySalary"
                    value={form.monthlySalary}
                    onChange={handleChange}
                    className="input"
                    placeholder="Monthly salary"
                  />
                  <input
                    type="number"
                    name="advanceTaken"
                    value={form.advanceTaken}
                    onChange={handleChange}
                    className="input"
                    placeholder="Advance taken"
                  />
                </>
              )}

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="input min-h-24 sm:col-span-2"
                placeholder="Notes"
              />

              <button disabled={saving} className="btn-primary sm:col-span-2">
                {saving
                  ? "Saving..."
                  : editingExpense
                  ? "Update Expense"
                  : "Create Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
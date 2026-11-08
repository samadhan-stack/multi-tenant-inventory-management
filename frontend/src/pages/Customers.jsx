
import { useEffect, useMemo, useState } from "react";
import {
    Plus, Search, Pencil, Trash2, RefreshCw, X,
    Users, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const emptyForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
};

function getErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again."
    );
}

function CustomerModal({ customer, onClose, onSave, saving }) {
    const [form, setForm] = useState(
        customer || emptyForm
    );
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Customer name is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Customer email is required.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            setError("Enter a valid email address.");
            return;
        }

        try {
            await onSave({
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                phone: form.phone.trim(),
                address: form.address.trim(),
            });
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl">

                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {customer ? "Edit Customer" : "Add Customer"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter customer contact information.
                        </p>
                    </div>

                    <button onClick={onClose} disabled={saving}>
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Customer Name *
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter customer name"
                            required
                            maxLength={150}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            placeholder="customer@example.com"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Phone
                        </label>
                        <input
                            name="phone"
                            value={form.phone || ""}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            maxLength={20}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={form.address || ""}
                            onChange={handleChange}
                            placeholder="Enter customer address"
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
                        >
                            {saving ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Customers() {
    const { user } = useAuth();

    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);
    const canDelete = user?.role === "ADMIN";

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const fetchCustomers = async () => {
        try {
            setError("");
            const response = await api.get("/customers");
            setCustomers(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return customers;

        return customers.filter((customer) =>
            [
                customer.name,
                customer.email,
                customer.phone,
                customer.address,
            ].some((value) =>
                String(value || "").toLowerCase().includes(keyword)
            )
        );
    }, [customers, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCustomers.length / PAGE_SIZE)
    );

    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    const visibleCustomers = filteredCustomers.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const handleSave = async (formData) => {
        setSaving(true);

        try {
            if (selectedCustomer) {
                await api.put(
                    `/customers/${selectedCustomer.id}`,
                    formData
                );
                setSuccess("Customer updated successfully.");
            } else {
                await api.post("/customers", formData);
                setSuccess("Customer created successfully.");
            }

            setShowModal(false);
            setSelectedCustomer(null);
            await fetchCustomers();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (customer) => {
        if (!window.confirm(`Delete customer "${customer.name}"?`)) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await api.delete(`/customers/${customer.id}`);
            setSuccess("Customer deleted successfully.");
            await fetchCustomers();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Customers
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage customer records and contact information.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchCustomers}
                        className="inline-flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-700"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    {canManage && (
                        <button
                            onClick={() => {
                                setSelectedCustomer(null);
                                setShowModal(true);
                                setSuccess("");
                            }}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            <Plus size={17} />
                            Add Customer
                        </button>
                    )}
                </div>
            </div>

            {success && (
                <div className="flex justify-between bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    {success}
                    <button onClick={() => setSuccess("")}><X size={16} /></button>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Users size={21} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Total Customers</p>
                        <p className="text-xl font-bold text-slate-900">
                            {customers.length}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <Search size={21} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Search Results</p>
                        <p className="text-xl font-bold text-slate-900">
                            {filteredCustomers.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Customer Directory
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredCustomers.length} customers found
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search customers..."
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw size={26} className="animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-slate-500 mt-3">Loading customers...</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users size={34} className="text-slate-300 mx-auto" />
                        <p className="font-medium text-slate-800 mt-3">No customers yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Add your first customer to get started.
                        </p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No customers match your search.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Customer</th>
                                    <th className="px-5 py-3">Email</th>
                                    <th className="px-5 py-3">Phone</th>
                                    <th className="px-5 py-3">Address</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {visibleCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {customer.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {customer.email}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {customer.phone || "-"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 max-w-52 truncate">
                                            {customer.address || "-"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                {canManage && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setShowModal(true);
                                                            setSuccess("");
                                                        }}
                                                        title="Edit customer"
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(customer)}
                                                        title="Delete customer"
                                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                                Showing {startIndex + 1} to{" "}
                                {Math.min(startIndex + PAGE_SIZE, filteredCustomers.length)}{" "}
                                of {filteredCustomers.length} customers
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(safePage - 1)}
                                    disabled={safePage === 1}
                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <span className="text-sm text-slate-600 px-2">
                  Page {safePage} of {totalPages}
                </span>

                                <button
                                    onClick={() => setCurrentPage(safePage + 1)}
                                    disabled={safePage === totalPages}
                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-40"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={() => {
                        if (saving) return;
                        setShowModal(false);
                        setSelectedCustomer(null);
                    }}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </div>
    );
}

export default Customers;

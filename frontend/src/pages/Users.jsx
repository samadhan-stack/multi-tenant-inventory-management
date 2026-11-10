import { useEffect, useMemo, useState } from "react";
import {
    Users as UsersIcon,
    Plus,
    Search,
    RefreshCw,
    X,
    ShieldCheck,
    UserCheck,
    UserX,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function getErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again."
    );
}

function CreateUserModal({ onClose, onSave, saving }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STAFF");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await onSave({
                fullName: fullName.trim(),
                email: email.trim(),
                password,
                role,
            });
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl">

                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Add Employee
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Create a Manager or Staff account.
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
                            Full Name *
                        </label>
                        <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Employee name"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="employee@company.com"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Temporary Password *
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Employee Role *
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium"
                        >
                            {saving ? "Creating..." : "Create Employee"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Users() {
    const { user } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const fetchEmployees = async () => {
        try {
            setError("");
            const response = await api.get("/users");
            setEmployees(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchEmployees();
        } else {
            setLoading(false);
        }
    }, [user?.role]);

    const filteredEmployees = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return employees;

        return employees.filter((employee) =>
            employee.fullName.toLowerCase().includes(keyword) ||
            employee.email.toLowerCase().includes(keyword) ||
            employee.role.toLowerCase().includes(keyword)
        );
    }, [employees, search]);

    const handleCreate = async (formData) => {
        setSaving(true);

        try {
            await api.post("/users", formData);
            setShowModal(false);
            setSuccess("Employee created successfully.");
            await fetchEmployees();
        } finally {
            setSaving(false);
        }
    };

    const handleRoleChange = async (employee, newRole) => {
        if (newRole === employee.role) return;

        const confirmed = window.confirm(
            `Change ${employee.fullName}'s role to ${newRole}?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.patch(`/users/${employee.id}/role`, {
                role: newRole,
            });

            setSuccess("Employee role updated successfully.");
            await fetchEmployees();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleStatusChange = async (employee) => {
        const newStatus = !employee.active;

        const confirmed = window.confirm(
            `${newStatus ? "Activate" : "Deactivate"} ${employee.fullName}?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.patch(`/users/${employee.id}/status`, {
                active: newStatus,
            });

            setSuccess(
                `Employee ${newStatus ? "activated" : "deactivated"} successfully.`
            );

            await fetchEmployees();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <ShieldCheck size={36} className="mx-auto text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-800 mt-3">
                    Access Restricted
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Only administrators can manage employees.
                </p>
            </div>
        );
    }

    const activeCount = employees.filter((employee) => employee.active).length;
    const managerCount = employees.filter((employee) => employee.role === "MANAGER").length;
    const staffCount = employees.filter((employee) => employee.role === "STAFF").length;

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        User Management
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage employees and their access to your workspace.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchEmployees}
                        className="inline-flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-700"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        <Plus size={17} />
                        Add Employee
                    </button>
                </div>
            </div>

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    {success}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <UsersIcon size={21} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Total Employees</p>
                        <p className="text-xl font-bold text-slate-900">{employees.length}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                        <UserCheck size={21} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Active Employees</p>
                        <p className="text-xl font-bold text-slate-900">{activeCount}</p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                        <ShieldCheck size={21} className="text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Managers / Staff</p>
                        <p className="text-xl font-bold text-slate-900">
                            {managerCount} / {staffCount}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Employee List
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredEmployees.length} employees found
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search employees..."
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw size={26} className="animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-slate-500 mt-3">
                            Loading employees...
                        </p>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="py-16 text-center">
                        <UsersIcon size={32} className="mx-auto text-slate-300" />
                        <p className="text-sm text-slate-500 mt-3">
                            No employees found.
                        </p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No employees match your search.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Employee</th>
                                <th className="px-5 py-3 font-semibold">Role</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Change Role</th>
                                <th className="px-5 py-3 font-semibold text-right">Action</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-slate-50">

                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {employee.fullName}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {employee.email}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                employee.role === "ADMIN"
                                                    ? "bg-purple-50 text-purple-700"
                                                    : employee.role === "MANAGER"
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {employee.role}
                                            </span>
                                    </td>

                                    <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                employee.active
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}>
                                                {employee.active ? "Active" : "Inactive"}
                                            </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        {employee.role === "ADMIN" ? (
                                            <span className="text-xs text-slate-400">
                                                    Protected
                                                </span>
                                        ) : (
                                            <select
                                                value={employee.role}
                                                disabled={!employee.active}
                                                onChange={(e) =>
                                                    handleRoleChange(employee, e.target.value)
                                                }
                                                className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500 disabled:bg-slate-100"
                                            >
                                                <option value="STAFF">Staff</option>
                                                <option value="MANAGER">Manager</option>
                                            </select>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        {employee.role === "ADMIN" ? (
                                            <span className="text-xs text-slate-400">
                                                    Protected
                                                </span>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusChange(employee)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                                    employee.active
                                                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                                                        : "border border-green-200 text-green-700 hover:bg-green-50"
                                                }`}
                                            >
                                                {employee.active ? (
                                                    <>
                                                        <UserX size={14} />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck size={14} />
                                                        Activate
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <CreateUserModal
                    onClose={() => {
                        if (!saving) setShowModal(false);
                    }}
                    onSave={handleCreate}
                    saving={saving}
                />
            )}
        </div>
    );
}

export default Users;
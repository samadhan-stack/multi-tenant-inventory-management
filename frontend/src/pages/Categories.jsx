
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    Tags,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

function getErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again."
    );
}

function CategoryModal({ category, onClose, onSave, saving }) {
    const [name, setName] = useState(category?.name || "");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Category name is required.");
            return;
        }

        try {
            await onSave({ name: name.trim() });
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
                            {category ? "Edit Category" : "Add Category"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Enter a category name.
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
                            Category Name *
                        </label>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Example: Electronics"
                            maxLength={100}
                            required
                            autoFocus
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
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
                            {saving ? "Saving..." : category ? "Update Category" : "Create Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Categories() {
    const { user } = useAuth();

    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);
    const canDelete = user?.role === "ADMIN";

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            setError("");
            const response = await api.get("/categories");
            setCategories(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return categories;

        return categories.filter((category) =>
            category.name.toLowerCase().includes(keyword)
        );
    }, [categories, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCategories.length / PAGE_SIZE)
    );

    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    const visibleCategories = filteredCategories.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const openCreateModal = () => {
        setSelectedCategory(null);
        setShowModal(true);
        setSuccess("");
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
        setSuccess("");
    };

    const handleSave = async (formData) => {
        setSaving(true);

        try {
            if (selectedCategory) {
                await api.put(
                    `/categories/${selectedCategory.id}`,
                    formData
                );
                setSuccess("Category updated successfully.");
            } else {
                await api.post("/categories", formData);
                setSuccess("Category created successfully.");
            }

            setShowModal(false);
            setSelectedCategory(null);
            await fetchCategories();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(`/categories/${category.id}`);
            setSuccess("Category deleted successfully.");
            await fetchCategories();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Categories
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Organize products into categories.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchCategories}
                        className="inline-flex items-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-700"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    {canManage && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            <Plus size={17} />
                            Add Category
                        </button>
                    )}
                </div>
            </div>

            {success && (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    {success}
                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertTriangle size={17} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Tags size={21} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Total Categories</p>
                        <p className="text-xl font-bold text-slate-900">
                            {categories.length}
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
                            {filteredCategories.length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Category List
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredCategories.length} categories found
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search categories..."
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw size={26} className="animate-spin text-blue-600 mx-auto" />
                        <p className="text-sm text-slate-500 mt-3">
                            Loading categories...
                        </p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-16 text-center">
                        <Tags size={34} className="text-slate-300 mx-auto" />
                        <p className="font-medium text-slate-800 mt-3">
                            No categories yet
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Create your first category to get started.
                        </p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No categories match your search.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Category ID</th>
                                    <th className="px-5 py-3">Category Name</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {visibleCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 text-slate-500">
                                            #{category.id}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <Tags size={17} className="text-blue-600" />
                                                </div>
                                                <span className="font-medium text-slate-800">
                            {category.name}
                          </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                {canManage && (
                                                    <button
                                                        onClick={() => openEditModal(category)}
                                                        title="Edit category"
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDelete(category)}
                                                        title="Delete category"
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
                                {Math.min(startIndex + PAGE_SIZE, filteredCategories.length)}{" "}
                                of {filteredCategories.length} categories
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(safePage - 1)}
                                    disabled={safePage === 1}
                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <span className="text-sm text-slate-600 px-2">
                  Page {safePage} of {totalPages}
                </span>

                                <button
                                    onClick={() => setCurrentPage(safePage + 1)}
                                    disabled={safePage === totalPages}
                                    className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <CategoryModal
                    category={selectedCategory}
                    onClose={() => {
                        if (saving) return;
                        setShowModal(false);
                        setSelectedCategory(null);
                    }}
                    onSave={handleSave}
                    saving={saving}
                />
            )}
        </div>
    );
}

export default Categories;

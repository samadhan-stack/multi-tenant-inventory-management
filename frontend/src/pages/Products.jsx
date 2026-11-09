
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Package,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const emptyForm = {
    name: "",
    sku: "",
    description: "",
    price: "",
    categoryId: "",
};

function getErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong. Please try again."
    );
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));
}

function getStockStatus(quantity) {
    if (quantity === 0) {
        return {
            label: "Out of Stock",
            className: "bg-red-50 text-red-700",
        };
    }

    if (quantity <= 5) {
        return {
            label: "Low Stock",
            className: "bg-amber-50 text-amber-700",
        };
    }

    return {
        label: "In Stock",
        className: "bg-green-50 text-green-700",
    };
}

function ProductModal({
                          product,
                          categories,
                          onClose,
                          onSave,
                          saving,
                      }) {
    const [form, setForm] = useState(
        product
            ? {
                name: product.name || "",
                sku: product.sku || "",
                description: product.description || "",
                price: String(product.price ?? ""),
                categoryId: product.categoryId
                    ? String(product.categoryId)
                    : "",
            }
            : emptyForm
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

        const price = Number(form.price);

        if (!form.name.trim() || !form.sku.trim()) {
            setError("Product name and SKU are required.");
            return;
        }

        if (!Number.isFinite(price) || price <= 0) {
            setError("Enter a valid price greater than zero.");
            return;
        }

        try {
            await onSave({
                name: form.name.trim(),
                sku: form.sku.trim(),
                description: form.description.trim(),
                price,
                categoryId: form.categoryId
                    ? Number(form.categoryId)
                    : null,
            });
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-lg max-h-[calc(100dvh-2rem)] rounded-xl shadow-xl flex flex-col overflow-hidden">

                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {product ? "Edit Product" : "Add Product"}
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            Enter the product information below.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="text-slate-400 hover:text-slate-700"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto min-h-0">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Product Name *
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Enter product name"
                            maxLength={150}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            SKU *
                        </label>

                        <input
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            placeholder="Example: LAP-001"
                            maxLength={100}
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="text-xs text-slate-400 mt-1">
                            SKU must be unique within your company.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Category
                        </label>

                        <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">Uncategorized</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <p className="text-xs text-slate-400 mt-1">
                            Select a category to organize this product.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Price (₹) *
                        </label>

                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                            required
                            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                            Stock quantity is managed separately through inventory
                            movements and purchase/sales orders.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium"
                        >
                            {saving
                                ? "Saving..."
                                : product
                                    ? "Update Product"
                                    : "Create Product"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

function ProductDetailsModal({ product, onClose }) {
    if (!product) return null;

    const stockStatus = getStockStatus(
        Number(product.stockQuantity || 0)
    );

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl">

                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <h2 className="font-semibold text-slate-900">
                        Product Details
                    </h2>

                    <button onClick={onClose}>
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-xs text-slate-500">Product Name</p>
                        <p className="font-semibold text-slate-900 mt-1">
                            {product.name}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">SKU</p>
                        <p className="text-sm text-slate-800 mt-1">
                            {product.sku}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Category</p>
                        <p className="text-sm text-slate-800 mt-1">
                            {product.categoryName || "Uncategorized"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Description</p>
                        <p className="text-sm text-slate-800 mt-1">
                            {product.description || "No description available"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="font-semibold text-slate-900 mt-1">
                            {formatCurrency(product.price)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Available Quantity</p>
                        <p className="font-semibold text-slate-900 mt-1">
                            {product.stockQuantity}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500 mb-2">Stock Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}>
              {stockStatus.label}
            </span>
                    </div>
                </div>

                <div className="px-6 pb-5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}

function Products() {
    const { user } = useAuth();

    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);
    const canDelete = user?.role === "ADMIN";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewProduct, setViewProduct] = useState(null);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    const fetchProducts = async () => {
        try {
            setPageError("");

            const [productResponse, categoryResponse] = await Promise.all([
                api.get("/products"),
                api.get("/categories"),
            ]);

            setProducts(productResponse.data);
            setCategories(categoryResponse.data);

        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return products.filter((product) => {

            const matchesSearch = !keyword || [
                product.name,
                product.sku,
                product.description,
                product.categoryName,
            ].some((value) =>
                String(value || "").toLowerCase().includes(keyword)
            );

            const matchesCategory =
                selectedCategory === "ALL" ||
                String(product.categoryId || "") === selectedCategory;

            return matchesSearch && matchesCategory;
        });

    }, [products, search, selectedCategory]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProducts.length / PAGE_SIZE)
    );

    const safePage = Math.min(currentPage, totalPages);

    const startIndex = (safePage - 1) * PAGE_SIZE;

    const visibleProducts = filteredProducts.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const openCreateModal = () => {
        setSelectedProduct(null);
        setShowForm(true);
        setSuccess("");
    };

    const openEditModal = (product) => {
        setSelectedProduct(product);
        setShowForm(true);
        setSuccess("");
    };

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setSelectedProduct(null);
    };

    const handleSave = async (formData) => {
        setSaving(true);

        try {
            if (selectedProduct) {
                await api.put(
                    `/products/${selectedProduct.id}`,
                    formData
                );

                setSuccess("Product updated successfully.");
            } else {
                await api.post("/products", formData);

                setSuccess("Product created successfully.");
            }

            setShowForm(false);
            setSelectedProduct(null);

            await fetchProducts();
        } catch (error) {
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) return;

        setPageError("");
        setSuccess("");

        try {
            await api.delete(`/products/${product.id}`);

            setSuccess("Product deleted successfully.");

            await fetchProducts();
        } catch (error) {
            setPageError(getErrorMessage(error));
        }
    };

    const handleView = async (productId) => {
        setPageError("");

        try {
            const response = await api.get(`/products/${productId}`);

            setViewProduct(response.data);
        } catch (error) {
            setPageError(getErrorMessage(error));
        }
    };

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Products
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Manage your product catalogue and stock information.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchProducts}
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
                            Add Product
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications */}
            {success && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
                    <span>{success}</span>
                    <button onClick={() => setSuccess("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {pageError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                    <span>{pageError}</span>
                </div>
            )}

            {/* Product summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Package size={21} className="text-blue-600" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Total Products</p>
                            <p className="text-xl font-bold text-slate-900">
                                {products.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <Package size={21} className="text-green-600" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">In Stock</p>
                            <p className="text-xl font-bold text-slate-900">
                                {products.filter((p) => p.stockQuantity > 5).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-3 rounded-lg">
                            <AlertTriangle size={21} className="text-amber-600" />
                        </div>

                        <div>
                            <p className="text-xs text-slate-500">Stock Alerts</p>
                            <p className="text-xl font-bold text-slate-900">
                                {products.filter((p) => p.stockQuantity <= 5).length}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Product table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div>
                        <h2 className="font-semibold text-slate-800">
                            Product Catalogue
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            {filteredProducts.length} products found
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search name, SKU or description..."
                            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-52 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                        >
                            <option value="ALL">All Categories</option>

                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="py-16 text-center">
                        <RefreshCw
                            size={28}
                            className="animate-spin text-blue-600 mx-auto"
                        />

                        <p className="text-sm text-slate-500 mt-3">
                            Loading products...
                        </p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-16 text-center">
                        <Package size={36} className="text-slate-300 mx-auto" />

                        <h3 className="font-medium text-slate-800 mt-3">
                            No products yet
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Add your first product to get started.
                        </p>

                        {canManage && (
                            <button
                                onClick={openCreateModal}
                                className="mt-4 text-sm text-blue-600 hover:underline"
                            >
                                Add your first product
                            </button>
                        )}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-16 text-center">
                        <Search size={30} className="text-slate-300 mx-auto" />

                        <p className="text-sm text-slate-500 mt-3">
                            No products match your search.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">

                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">SKU</th>
                                    <th className="px-5 py-3">Category</th>
                                    <th className="px-5 py-3">Price</th>
                                    <th className="px-5 py-3">Quantity</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                {visibleProducts.map((product) => {
                                    const stockStatus = getStockStatus(
                                        Number(product.stockQuantity || 0)
                                    );

                                    return (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {product.name}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1 max-w-52 truncate">
                                                    {product.description || "No description"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {product.sku}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {product.categoryName || (
                                                    <span className="text-slate-400 italic">
                                                        Uncategorized
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                {formatCurrency(product.price)}
                                            </td>

                                            <td className="px-5 py-4 text-slate-700">
                                                {product.stockQuantity}
                                            </td>

                                            <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-2">

                                                    <button
                                                        onClick={() => handleView(product.id)}
                                                        title="View product"
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {canManage && (
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            title="Edit product"
                                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    )}

                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(product)}
                                                            title="Delete product"
                                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    )}

                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>

                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">

                            <p className="text-xs text-slate-500">
                                Showing {startIndex + 1} to{" "}
                                {Math.min(startIndex + PAGE_SIZE, filteredProducts.length)}{" "}
                                of {filteredProducts.length} products
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

            {/* Add / Edit modal */}
            {showForm && (
                <ProductModal
                    product={selectedProduct}
                    categories={categories}
                    onClose={closeForm}
                    onSave={handleSave}
                    saving={saving}
                />
            )}

            {/* Product details modal */}
            {viewProduct && (
                <ProductDetailsModal
                    product={viewProduct}
                    onClose={() => setViewProduct(null)}
                />
            )}

        </div>
    );
}

export default Products;

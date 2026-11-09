
import { useEffect, useMemo, useState } from "react";
import {
    ArrowDownToLine, ArrowUpFromLine, RefreshCw, Search,
    History, Package, AlertTriangle, X, ChevronLeft,
    ChevronRight, Plus, Minus, Eye
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const formatDate = (value) =>
    value ? new Date(value).toLocaleString("en-IN") : "—";

const movementStyles = {
    STOCK_IN: "bg-green-100 text-green-700",
    STOCK_OUT: "bg-red-100 text-red-700",
};

export default function Inventory() {
    const { user } = useAuth();
    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);

    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [notice, setNotice] = useState("");

    const [showMovementModal, setShowMovementModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyProduct, setHistoryProduct] = useState(null);
    const [productMovements, setProductMovements] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [form, setForm] = useState({
        productId: "",
        movementType: "STOCK_IN",
        quantity: 1,
        reason: "",
    });

    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);

        try {
            const [productsResponse, movementsResponse] = await Promise.all([
                api.get("/products"),
                api.get("/stock-movements"),
            ]);

            setProducts(productsResponse.data);
            setMovements(movementsResponse.data);
        } catch (error) {
            setNotice(
                error.response?.data?.message || "Unable to load inventory data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalProducts = products.length;

    const totalUnits = products.reduce(
        (sum, product) => sum + Number(product.stockQuantity || 0),
        0
    );

    const lowStockProducts = products.filter(
        (product) =>
            Number(product.stockQuantity) > 0 &&
            Number(product.stockQuantity) <= 5
    ).length;

    const outOfStockProducts = products.filter(
        (product) => Number(product.stockQuantity) === 0
    ).length;

    const filteredMovements = useMemo(() => {
        return movements.filter((movement) => {
            const matchesSearch =
                movement.productName?.toLowerCase().includes(search.toLowerCase()) ||
                movement.sku?.toLowerCase().includes(search.toLowerCase()) ||
                movement.reason?.toLowerCase().includes(search.toLowerCase());

            const matchesType =
                typeFilter === "ALL" || movement.movementType === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [movements, search, typeFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMovements.length / PAGE_SIZE)
    );

    const paginatedMovements = filteredMovements.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const resetForm = () => {
        setForm({
            productId: "",
            movementType: "STOCK_IN",
            quantity: 1,
            reason: "",
        });
    };

    const handleMovement = async (event) => {
        event.preventDefault();

        if (!form.productId) {
            setNotice("Please select a product.");
            return;
        }

        if (Number(form.quantity) <= 0) {
            setNotice("Quantity must be greater than zero.");
            return;
        }

        if (!form.reason.trim()) {
            setNotice("Please enter a reason for this movement.");
            return;
        }

        setSaving(true);
        setNotice("");

        try {
            await api.post(
                `/products/${form.productId}/stock-movements`,
                {
                    movementType: form.movementType,
                    quantity: Number(form.quantity),
                    reason: form.reason.trim(),
                }
            );

            setShowMovementModal(false);
            resetForm();

            setNotice("Stock movement recorded successfully.");
            await fetchData();
        } catch (error) {
            setNotice(
                error.response?.data?.message || "Unable to record stock movement."
            );
        } finally {
            setSaving(false);
        }
    };

    const openProductHistory = async (product) => {
        setHistoryProduct(product);
        setShowHistoryModal(true);
        setHistoryLoading(true);

        try {
            const response = await api.get(
                `/products/${product.id}/stock-movements`
            );

            setProductMovements(response.data);
        } catch (error) {
            setNotice(
                error.response?.data?.message || "Unable to load product history."
            );
            setProductMovements([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor stock levels and track inventory movements.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>

                    {canManage && (
                        <button
                            onClick={() => setShowMovementModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus size={17} /> Stock Adjustment
                        </button>
                    )}
                </div>
            </div>

            {notice && (
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <span>{notice}</span>
                    <button onClick={() => setNotice("")}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Inventory summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Products"
                    value={totalProducts}
                    icon={<Package size={20} />}
                />
                <SummaryCard
                    title="Total Stock Units"
                    value={totalUnits.toLocaleString("en-IN")}
                    icon={<History size={20} />}
                />
                <SummaryCard
                    title="Low Stock Products"
                    value={lowStockProducts}
                    icon={<AlertTriangle size={20} />}
                />
                <SummaryCard
                    title="Out of Stock"
                    value={outOfStockProducts}
                    icon={<Package size={20} />}
                />
            </div>

            {/* Product stock overview */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-800">Current Stock Levels</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Current quantity available for each product.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Product</th>
                            <th className="px-5 py-4">SKU</th>
                            <th className="px-5 py-4">Current Stock</th>
                            <th className="px-5 py-4">Stock Status</th>
                            <th className="px-5 py-4 text-right">History</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                    Loading inventory...
                                </td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                    No products found.
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => {
                                const stock = Number(product.stockQuantity || 0);

                                const status =
                                    stock === 0
                                        ? "Out of Stock"
                                        : stock <= 5
                                            ? "Low Stock"
                                            : "In Stock";

                                const statusClass =
                                    stock === 0
                                        ? "bg-red-100 text-red-700"
                                        : stock <= 5
                                            ? "bg-amber-100 text-amber-700"
                                            : "bg-green-100 text-green-700";

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-800">
                                            {product.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-500">
                                            {product.sku}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-800">
                                            {stock.toLocaleString("en-IN")}
                                        </td>
                                        <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                          {status}
                        </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => openProductHistory(product)}
                                                title="View movement history"
                                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Stock movement history */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-800">Stock Movement History</h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Purchase receipts, sales dispatches and manual adjustments.
                    </p>
                </div>

                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search product, SKU or reason..."
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All movements</option>
                        <option value="STOCK_IN">Stock In</option>
                        <option value="STOCK_OUT">Stock Out</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Product</th>
                            <th className="px-5 py-4">Movement</th>
                            <th className="px-5 py-4">Quantity</th>
                            <th className="px-5 py-4">Reason</th>
                            <th className="px-5 py-4">Date & Time</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                    Loading movements...
                                </td>
                            </tr>
                        ) : paginatedMovements.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                                    No stock movements found.
                                </td>
                            </tr>
                        ) : (
                            paginatedMovements.map((movement) => (
                                <tr key={movement.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-slate-800">
                                            {movement.productName}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {movement.sku}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${movementStyles[movement.movementType] || "bg-slate-100 text-slate-700"}`}>
                        {movement.movementType === "STOCK_IN" ? (
                            <ArrowDownToLine size={13} />
                        ) : (
                            <ArrowUpFromLine size={13} />
                        )}
                          {movement.movementType?.replace("_", " ")}
                      </span>
                                    </td>

                                    <td className="px-5 py-4 font-semibold text-slate-800">
                                        {movement.quantity}
                                    </td>

                                    <td className="max-w-xs px-5 py-4 text-slate-600">
                                        {movement.reason}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                        {formatDate(movement.createdAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                    <p className="text-xs text-slate-500">
                        Showing {filteredMovements.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                        {" "}to {Math.min(page * PAGE_SIZE, filteredMovements.length)}
                        {" "}of {filteredMovements.length} movements
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                        >
                            <ChevronLeft size={17} />
                        </button>
                        <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Manual stock movement modal */}
            {showMovementModal && (
                <Modal
                    title="Record Stock Movement"
                    onClose={() => {
                        setShowMovementModal(false);
                        resetForm();
                    }}
                >
                    <form onSubmit={handleMovement} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Product *
                            </label>
                            <select
                                required
                                value={form.productId}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        productId: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Select product</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} ({product.sku}) — Stock: {product.stockQuantity}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Movement Type *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            movementType: "STOCK_IN",
                                        }))
                                    }
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                                        form.movementType === "STOCK_IN"
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : "border-slate-200 text-slate-600"
                                    }`}
                                >
                                    <Plus size={17} /> Stock In
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setForm((current) => ({
                                            ...current,
                                            movementType: "STOCK_OUT",
                                        }))
                                    }
                                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${
                                        form.movementType === "STOCK_OUT"
                                            ? "border-red-500 bg-red-50 text-red-700"
                                            : "border-slate-200 text-slate-600"
                                    }`}
                                >
                                    <Minus size={17} /> Stock Out
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        quantity: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Reason *
                            </label>
                            <textarea
                                required
                                rows="3"
                                value={form.reason}
                                onChange={(e) =>
                                    setForm((current) => ({
                                        ...current,
                                        reason: e.target.value,
                                    }))
                                }
                                placeholder="Example: Damaged goods, opening stock, manual correction..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowMovementModal(false);
                                    resetForm();
                                }}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Record Movement"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Product movement history modal */}
            {showHistoryModal && historyProduct && (
                <Modal
                    title={`Movement History — ${historyProduct.name}`}
                    onClose={() => setShowHistoryModal(false)}
                >
                    {historyLoading ? (
                        <p className="py-8 text-center text-sm text-slate-500">
                            Loading product history...
                        </p>
                    ) : productMovements.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-500">
                            No movements found for this product.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500">
                                <tr>
                                    <th className="px-3 py-3">Type</th>
                                    <th className="px-3 py-3">Quantity</th>
                                    <th className="px-3 py-3">Reason</th>
                                    <th className="px-3 py-3">Date</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {productMovements.map((movement) => (
                                    <tr key={movement.id}>
                                        <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${movementStyles[movement.movementType] || ""}`}>
                          {movement.movementType?.replace("_", " ")}
                        </span>
                                        </td>
                                        <td className="px-3 py-3 font-medium">
                                            {movement.quantity}
                                        </td>
                                        <td className="px-3 py-3 text-slate-600">
                                            {movement.reason}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                                            {formatDate(movement.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}

function SummaryCard({ title, value, icon }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{title}</p>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-800">{value}</p>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <h2 className="font-semibold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}


import { useEffect, useMemo, useState } from "react";
import {
    Plus, Search, RefreshCw, Eye, CheckCircle,
    PackageCheck, XCircle, Trash2, ShoppingCart,
    X, ChevronLeft, ChevronRight, AlertCircle
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));

const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    RECEIVED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
    return (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.DRAFT}`}>
      {status}
    </span>
    );
}

function PurchaseOrderModal({
                                onClose,
                                onSave,
                                suppliers,
                                products,
                                saving,
                            }) {
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState([
        { productId: "", quantity: 1, unitPrice: "" },
    ]);
    const [error, setError] = useState("");

    const updateItem = (index, field, value) => {
        setItems((current) =>
            current.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const addItem = () => {
        setItems((current) => [
            ...current,
            { productId: "", quantity: 1, unitPrice: "" },
        ]);
    };

    const removeItem = (index) => {
        setItems((current) => current.filter((_, i) => i !== index));
    };

    const total = items.reduce(
        (sum, item) =>
            sum +
            (Number(item.quantity) || 0) *
            (Number(item.unitPrice) || 0),
        0
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!supplierId) {
            setError("Please select a supplier.");
            return;
        }

        if (items.length === 0) {
            setError("Add at least one product.");
            return;
        }

        const productIds = items.map((item) => item.productId);

        if (productIds.some((id) => !id)) {
            setError("Please select a product for every row.");
            return;
        }

        if (new Set(productIds).size !== productIds.length) {
            setError("A product can only be added once. Update its quantity instead.");
            return;
        }

        if (
            items.some(
                (item) =>
                    !Number.isInteger(Number(item.quantity)) ||
                    Number(item.quantity) <= 0 ||
                    !Number.isFinite(Number(item.unitPrice)) ||
                    Number(item.unitPrice) <= 0
            )
        ) {
            setError("Quantity and unit price must be greater than zero.");
            return;
        }

        try {
            await onSave({
                supplierId: Number(supplierId),
                items: items.map((item) => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                })),
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create purchase order."
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Create Purchase Order
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Select a supplier and add products.
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Supplier *
                        </label>
                        <select
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800">Order Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                                <Plus size={16} /> Add product
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-12"
                                >
                                    <div className="sm:col-span-5">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Product
                                        </label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) =>
                                                updateItem(index, "productId", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                            required
                                        >
                                            <option value="">Select product</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.sku})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                updateItem(index, "quantity", e.target.value)
                                            }
                                            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label className="mb-1 block text-xs text-slate-500">
                                            Unit Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) =>
                                                updateItem(index, "unitPrice", e.target.value)
                                            }
                                            placeholder="0.00"
                                            className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-end justify-between sm:col-span-2">
                                        <div className="text-sm font-semibold text-slate-700">
                                            {formatCurrency(
                                                Number(item.quantity) * Number(item.unitPrice)
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={items.length === 1}
                                            onClick={() => removeItem(index)}
                                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                                            title="Remove item"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                        <span className="font-semibold text-slate-700">Estimated Total</span>
                        <span className="text-xl font-bold text-slate-900">
              {formatCurrency(total)}
            </span>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || suppliers.length === 0 || products.length === 0}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Creating..." : "Create Purchase Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PurchaseOrderDetails({ order, onClose }) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Purchase Order Details
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {order.orderNumber}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5">
                    <div>
                        <p className="text-xs text-slate-500">Supplier</p>
                        <p className="mt-1 font-semibold text-slate-800">
                            {order.supplierName}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Order Date</p>
                        <p className="mt-1 font-semibold text-slate-800">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <div className="mt-1">
                            <StatusBadge status={order.status} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="mt-1 font-bold text-slate-900">
                            {formatCurrency(order.totalAmount)}
                        </p>
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <h3 className="mb-3 font-semibold text-slate-800">Products</h3>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-slate-500">
                            <tr>
                                <th className="p-3">Product</th>
                                <th className="p-3">SKU</th>
                                <th className="p-3 text-right">Qty</th>
                                <th className="p-3 text-right">Unit Price</th>
                                <th className="p-3 text-right">Subtotal</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {(order.items || []).map((item) => (
                                <tr key={item.id}>
                                    <td className="p-3 font-medium text-slate-800">
                                        {item.productName}
                                    </td>
                                    <td className="p-3 text-slate-500">{item.sku}</td>
                                    <td className="p-3 text-right">{item.quantity}</td>
                                    <td className="p-3 text-right">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="p-3 text-right font-medium">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end border-t p-5">
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PurchaseOrders() {
    const { user } = useAuth();
    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);

    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [notice, setNotice] = useState("");
    const [error, setError] = useState("");

    const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
            const [ordersRes, suppliersRes, productsRes] = await Promise.all([
                api.get("/purchase-orders"),
                api.get("/suppliers"),
                api.get("/products"),
            ]);

            setOrders(ordersRes.data);
            setSuppliers(suppliersRes.data);
            setProducts(productsRes.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load purchase order data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
                order.supplierName?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / PAGE_SIZE)
    );

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const stats = {
        total: orders.length,
        draft: orders.filter((o) => o.status === "DRAFT").length,
        confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
        received: orders.filter((o) => o.status === "RECEIVED").length,
    };

    const handleCreate = async (payload) => {
        setSaving(true);

        try {
            await api.post("/purchase-orders", payload);
            setShowCreate(false);
            setNotice("Purchase order created successfully.");
            await fetchData();
        } finally {
            setSaving(false);
        }
    };

    const handleAction = async (order, action, label) => {
        const confirmed = window.confirm(
            `Are you sure you want to ${label.toLowerCase()} ${order.orderNumber}?`
        );

        if (!confirmed) return;

        setNotice("");
        setError("");

        try {
            await api.patch(`/purchase-orders/${order.id}/${action}`);
            setNotice(`${order.orderNumber} ${label.toLowerCase()} successfully.`);
            await fetchData();

            if (selectedOrder?.id === order.id) {
                const response = await api.get(`/purchase-orders/${order.id}`);
                setSelectedOrder(response.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                `Unable to ${label.toLowerCase()} purchase order.`
            );
        }
    };

    const openDetails = async (order) => {
        try {
            const response = await api.get(`/purchase-orders/${order.id}`);
            setSelectedOrder(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load purchase order details."
            );
        }
    };

    const statCards = [
        {
            label: "Total Orders",
            value: stats.total,
            icon: ShoppingCart,
            color: "text-blue-600 bg-blue-50",
        },
        {
            label: "Draft",
            value: stats.draft,
            icon: AlertCircle,
            color: "text-slate-600 bg-slate-100",
        },
        {
            label: "Confirmed",
            value: stats.confirmed,
            icon: CheckCircle,
            color: "text-blue-600 bg-blue-50",
        },
        {
            label: "Received",
            value: stats.received,
            icon: PackageCheck,
            color: "text-emerald-600 bg-emerald-50",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Purchase Orders
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage supplier purchases and incoming inventory.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>

                    {canManage && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            <Plus size={17} /> New Purchase Order
                        </button>
                    )}
                </div>
            </div>

            {notice && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {notice}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{card.label}</p>
                                    <p className="mt-2 text-2xl font-bold text-slate-800">
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon size={21} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
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
                            placeholder="Search order number or supplier..."
                            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="RECEIVED">Received</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-sm text-slate-500">
                        Loading purchase orders...
                    </div>
                ) : paginatedOrders.length === 0 ? (
                    <div className="p-12 text-center">
                        <ShoppingCart className="mx-auto mb-3 text-slate-300" size={36} />
                        <p className="font-semibold text-slate-700">
                            No purchase orders found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Create a purchase order or change your search filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-3">Order Number</th>
                                <th className="px-5 py-3">Supplier</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3 text-right">Items</th>
                                <th className="px-5 py-3 text-right">Total</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-semibold text-blue-700">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-5 py-4 text-slate-700">
                                        {order.supplierName}
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {order.items?.length || 0}
                                    </td>
                                    <td className="px-5 py-4 text-right font-semibold text-slate-800">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => openDetails(order)}
                                                title="View details"
                                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                            >
                                                <Eye size={17} />
                                            </button>

                                            {canManage && order.status === "DRAFT" && (
                                                <button
                                                    onClick={() => handleAction(order, "confirm", "Confirm")}
                                                    title="Confirm order"
                                                    className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                >
                                                    <CheckCircle size={17} />
                                                </button>
                                            )}

                                            {canManage && order.status === "CONFIRMED" && (
                                                <button
                                                    onClick={() => handleAction(order, "receive", "Receive")}
                                                    title="Receive order"
                                                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                                                >
                                                    <PackageCheck size={17} />
                                                </button>
                                            )}

                                            {canManage &&
                                                ["DRAFT", "CONFIRMED"].includes(order.status) && (
                                                    <button
                                                        onClick={() => handleAction(order, "cancel", "Cancel")}
                                                        title="Cancel order"
                                                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <XCircle size={17} />
                                                    </button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredOrders.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t px-5 py-4 sm:flex-row">
                        <p className="text-sm text-slate-500">
                            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                            {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} of{" "}
                            {filteredOrders.length} orders
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="rounded-lg border p-2 disabled:opacity-40"
                            >
                                <ChevronLeft size={17} />
                            </button>
                            <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="rounded-lg border p-2 disabled:opacity-40"
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showCreate && (
                <PurchaseOrderModal
                    suppliers={suppliers}
                    products={products}
                    saving={saving}
                    onClose={() => setShowCreate(false)}
                    onSave={handleCreate}
                />
            )}

            {selectedOrder && (
                <PurchaseOrderDetails
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}

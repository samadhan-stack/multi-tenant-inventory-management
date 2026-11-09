
import { useEffect, useMemo, useState } from "react";
import {
    Plus, Search, Eye, RefreshCw, X, ShoppingCart,
    CheckCircle, Truck, Ban, ChevronLeft, ChevronRight,
    Package, IndianRupee
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const statusStyles = {
    DRAFT: "bg-slate-100 text-slate-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    DISPATCHED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

export default function SalesOrders() {
    const { user } = useAuth();
    const canManage = ["ADMIN", "MANAGER"].includes(user?.role);

    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);

    const [showCreate, setShowCreate] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [form, setForm] = useState({
        customerId: "",
        items: [{ productId: "", quantity: 1 }],
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, customersRes, productsRes] = await Promise.all([
                api.get("/sales-orders"),
                api.get("/customers"),
                api.get("/products"),
            ]);

            setOrders(ordersRes.data);
            setCustomers(customersRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            setNotice(error.response?.data?.message || "Unable to load sales orders.");
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
                order.customerName?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
    const paginatedOrders = filteredOrders.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const totalSales = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    const dispatchedOrders = orders.filter(
        (order) => order.status === "DISPATCHED"
    ).length;

    const addItem = () => {
        setForm((current) => ({
            ...current,
            items: [...current.items, { productId: "", quantity: 1 }],
        }));
    };

    const removeItem = (index) => {
        setForm((current) => ({
            ...current,
            items: current.items.filter((_, i) => i !== index),
        }));
    };

    const updateItem = (index, field, value) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const estimatedTotal = form.items.reduce((sum, item) => {
        const product = products.find(
            (p) => String(p.id) === String(item.productId)
        );

        return sum + Number(product?.price || 0) * Number(item.quantity || 0);
    }, 0);

    const resetForm = () => {
        setForm({
            customerId: "",
            items: [{ productId: "", quantity: 1 }],
        });
    };

    const handleCreate = async (event) => {
        event.preventDefault();

        if (!form.customerId) {
            setNotice("Please select a customer.");
            return;
        }

        if (form.items.length === 0) {
            setNotice("Please add at least one product.");
            return;
        }

        const productIds = form.items.map((item) => item.productId);

        if (productIds.some((id) => !id)) {
            setNotice("Please select a product for every item.");
            return;
        }

        if (new Set(productIds).size !== productIds.length) {
            setNotice("A product can only be added once. Update its quantity instead.");
            return;
        }

        if (form.items.some((item) => Number(item.quantity) <= 0)) {
            setNotice("Quantity must be greater than zero.");
            return;
        }

        setSaving(true);
        setNotice("");

        try {
            const payload = {
                customerId: Number(form.customerId),
                items: form.items.map((item) => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                })),
            };

            await api.post("/sales-orders", payload);

            setShowCreate(false);
            resetForm();
            setNotice("Sales order created successfully.");
            await fetchData();
        } catch (error) {
            setNotice(
                error.response?.data?.message || "Unable to create sales order."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAction = async (order, action) => {
        const actionLabels = {
            confirm: "confirm",
            dispatch: "dispatch",
            cancel: "cancel",
        };

        if (!window.confirm(`Are you sure you want to ${actionLabels[action]} this order?`)) {
            return;
        }

        try {
            await api.patch(`/sales-orders/${order.id}/${action}`);

            setNotice(`Sales order ${action}ed successfully.`);

            if (selectedOrder?.id === order.id) {
                const response = await api.get(`/sales-orders/${order.id}`);
                setSelectedOrder(response.data);
            }

            await fetchData();
        } catch (error) {
            setNotice(
                error.response?.data?.message ||
                `Unable to ${action} sales order.`
            );
        }
    };

    const openDetails = async (order) => {
        try {
            const response = await api.get(`/sales-orders/${order.id}`);
            setSelectedOrder(response.data);
            setShowDetails(true);
        } catch (error) {
            setNotice(error.response?.data?.message || "Unable to load order details.");
        }
    };

    const closeCreate = () => {
        setShowCreate(false);
        resetForm();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Sales Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage customer orders and product dispatch.
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
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus size={17} /> Create Sales Order
                        </button>
                    )}
                </div>
            </div>

            {notice && (
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <span>{notice}</span>
                    <button onClick={() => setNotice("")}><X size={16} /></button>
                </div>
            )}

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    title="Total Orders"
                    value={orders.length}
                    icon={<ShoppingCart size={20} />}
                />
                <SummaryCard
                    title="Total Order Value"
                    value={formatCurrency(totalSales)}
                    icon={<IndianRupee size={20} />}
                />
                <SummaryCard
                    title="Dispatched Orders"
                    value={dispatchedOrders}
                    icon={<Truck size={20} />}
                />
                <SummaryCard
                    title="Pending Orders"
                    value={orders.filter((o) => ["DRAFT", "CONFIRMED"].includes(o.status)).length}
                    icon={<Package size={20} />}
                />
            </div>

            {/* Orders table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                            placeholder="Search order number or customer..."
                            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="DISPATCHED">Dispatched</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Order Number</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Items</th>
                            <th className="px-5 py-4">Total Amount</th>
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                                    Loading sales orders...
                                </td>
                            </tr>
                        ) : paginatedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-5 py-12 text-center text-slate-500">
                                    No sales orders found.
                                </td>
                            </tr>
                        ) : (
                            paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        {order.customerName}
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">
                                        {order.items?.length || 0}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                                        {formatCurrency(order.totalAmount)}
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                        {order.createdAt
                                            ? new Date(order.createdAt).toLocaleDateString("en-IN")
                                            : "—"}
                                    </td>
                                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] || ""}`}>
                        {order.status}
                      </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton
                                                title="View details"
                                                onClick={() => openDetails(order)}
                                            >
                                                <Eye size={16} />
                                            </ActionButton>

                                            {canManage && order.status === "DRAFT" && (
                                                <ActionButton
                                                    title="Confirm order"
                                                    onClick={() => handleAction(order, "confirm")}
                                                >
                                                    <CheckCircle size={16} />
                                                </ActionButton>
                                            )}

                                            {canManage && order.status === "CONFIRMED" && (
                                                <ActionButton
                                                    title="Dispatch order"
                                                    onClick={() => handleAction(order, "dispatch")}
                                                >
                                                    <Truck size={16} />
                                                </ActionButton>
                                            )}

                                            {canManage && ["DRAFT", "CONFIRMED"].includes(order.status) && (
                                                <ActionButton
                                                    title="Cancel order"
                                                    onClick={() => handleAction(order, "cancel")}
                                                >
                                                    <Ban size={16} />
                                                </ActionButton>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row">
                    <p className="text-xs text-slate-500">
                        Showing {filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                        {" "}to {Math.min(page * PAGE_SIZE, filteredOrders.length)}
                        {" "}of {filteredOrders.length} orders
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
            </div>

            {/* Create order modal */}
            {showCreate && (
                <Modal title="Create Sales Order" onClose={closeCreate}>
                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Customer *
                            </label>
                            <select
                                required
                                value={form.customerId}
                                onChange={(e) =>
                                    setForm((current) => ({ ...current, customerId: e.target.value }))
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                            >
                                <option value="">Select customer</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-800">Order Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                                >
                                    <Plus size={15} /> Add product
                                </button>
                            </div>

                            <div className="space-y-3">
                                {form.items.map((item, index) => {
                                    const product = products.find(
                                        (p) => String(p.id) === String(item.productId)
                                    );

                                    return (
                                        <div key={index} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_110px_auto]">
                                            <div>
                                                <label className="mb-1 block text-xs text-slate-500">
                                                    Product
                                                </label>
                                                <select
                                                    required
                                                    value={item.productId}
                                                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} ({p.sku}) — {formatCurrency(p.price)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {product && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Available stock: {product.stockQuantity}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs text-slate-500">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    disabled={form.items.length === 1}
                                                    onClick={() => removeItem(index)}
                                                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                                >
                                                    <X size={17} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Estimated total</span>
                                <span className="text-lg font-bold text-slate-800">
                  {formatCurrency(estimatedTotal)}
                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Unit prices are taken from the current product selling price.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={closeCreate}
                                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? "Creating..." : "Create Order"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Order details modal */}
            {showDetails && selectedOrder && (
                <Modal
                    title={`Sales Order — ${selectedOrder.orderNumber}`}
                    onClose={() => setShowDetails(false)}
                >
                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
                            <Detail label="Customer" value={selectedOrder.customerName} />
                            <Detail label="Status" value={selectedOrder.status} />
                            <Detail label="Order Date" value={
                                                           selectedOrder.createdAt
                                                               ? new Date(selectedOrder.createdAt).toLocaleString("en-IN")
                                                               : "—"
                                                       } />
                            <Detail label="Total Amount" value={formatCurrency(selectedOrder.totalAmount)} />
                        </div>

                        <div>
                            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                Products
                            </h3>
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500">
                                    <tr>
                                        <th className="px-3 py-3">Product</th>
                                        <th className="px-3 py-3">Qty</th>
                                        <th className="px-3 py-3">Unit Price</th>
                                        <th className="px-3 py-3">Subtotal</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                    {selectedOrder.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-slate-800">{item.productName}</p>
                                                <p className="text-xs text-slate-500">{item.sku}</p>
                                            </td>
                                            <td className="px-3 py-3">{item.quantity}</td>
                                            <td className="px-3 py-3">{formatCurrency(item.unitPrice)}</td>
                                            <td className="px-3 py-3 font-medium">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {canManage && (
                            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                                {selectedOrder.status === "DRAFT" && (
                                    <button
                                        onClick={() => handleAction(selectedOrder, "confirm")}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                                    >
                                        Confirm Order
                                    </button>
                                )}

                                {selectedOrder.status === "CONFIRMED" && (
                                    <button
                                        onClick={() => handleAction(selectedOrder, "dispatch")}
                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white"
                                    >
                                        Dispatch Order
                                    </button>
                                )}

                                {["DRAFT", "CONFIRMED"].includes(selectedOrder.status) && (
                                    <button
                                        onClick={() => handleAction(selectedOrder, "cancel")}
                                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
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

function ActionButton({ children, title, onClick }) {
    return (
        <button
            title={title}
            onClick={onClick}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
        >
            {children}
        </button>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                    <h2 className="font-semibold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-slate-800">{value || "—"}</p>
        </div>
    );
}

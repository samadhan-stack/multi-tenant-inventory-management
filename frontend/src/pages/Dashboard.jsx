
import { useEffect, useState } from "react";
import {
    Package,
    Users,
    Truck,
    Wallet,
    AlertTriangle,
    CircleAlert,
    ShoppingCart,
    ClipboardList,
    ArrowDownToLine,
    ArrowUpFromLine,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

import api from "../services/api";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}

function formatDate(value) {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatCard({ title, value, icon: Icon, description }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{title}</p>

                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Icon size={20} className="text-blue-600" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mt-4">
                {value}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
                {description}
            </p>
        </div>
    );
}

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setError("");

            const response = await api.get("/dashboard");

            setDashboard(response.data);
        } catch (err) {
            console.error("Dashboard API error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load dashboard data. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-80">
                <div className="text-center">
                    <RefreshCw
                        size={28}
                        className="animate-spin text-blue-600 mx-auto"
                    />
                    <p className="text-sm text-slate-500 mt-3">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
                <AlertTriangle size={32} className="text-red-500 mx-auto" />

                <h3 className="text-lg font-semibold text-slate-800 mt-3">
                    Dashboard unavailable
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                    {error}
                </p>

                <button
                    onClick={fetchDashboard}
                    className="mt-5 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            </div>
        );
    }

    const stockData = [
        {
            name: "Healthy Stock",
            value: Math.max(
                0,
                dashboard.totalProducts -
                dashboard.lowStockProducts -
                dashboard.outOfStockProducts
            ),
        },
        {
            name: "Low Stock",
            value: dashboard.lowStockProducts,
        },
        {
            name: "Out of Stock",
            value: dashboard.outOfStockProducts,
        },
    ];

    const orderData = [
        {
            name: "Sales",
            amount: Number(dashboard.totalSalesAmount || 0),
        },
        {
            name: "Purchases",
            amount: Number(dashboard.totalPurchaseAmount || 0),
        },
    ];

    const movementList = dashboard.recentStockMovements || [];

    return (
        <div className="space-y-6">

            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Dashboard
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Overview of your inventory and business performance.
                    </p>
                </div>

                <button
                    onClick={fetchDashboard}
                    className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Main statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <StatCard
                    title="Total Products"
                    value={dashboard.totalProducts}
                    icon={Package}
                    description="Products registered"
                />

                <StatCard
                    title="Total Customers"
                    value={dashboard.totalCustomers}
                    icon={Users}
                    description="Customers registered"
                />

                <StatCard
                    title="Total Suppliers"
                    value={dashboard.totalSuppliers}
                    icon={Truck}
                    description="Suppliers registered"
                />

                <StatCard
                    title="Inventory Value"
                    value={formatCurrency(dashboard.inventoryValue)}
                    icon={Wallet}
                    description="Current stock value"
                />

            </div>

            {/* Inventory alerts and order statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <StatCard
                    title="Low Stock Products"
                    value={dashboard.lowStockProducts}
                    icon={AlertTriangle}
                    description="Products below stock threshold"
                />

                <StatCard
                    title="Out of Stock"
                    value={dashboard.outOfStockProducts}
                    icon={CircleAlert}
                    description="Products with zero stock"
                />

                <StatCard
                    title="Sales Orders"
                    value={dashboard.totalSalesOrders}
                    icon={ShoppingCart}
                    description="Total sales orders"
                />

                <StatCard
                    title="Purchase Orders"
                    value={dashboard.totalPurchaseOrders}
                    icon={ClipboardList}
                    description="Total purchase orders"
                />

            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Stock distribution */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-800">
                        Inventory Distribution
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                        Product stock status
                    </p>

                    <div className="h-72 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={3}
                                >
                                    {stockData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={["#2563eb", "#f59e0b", "#ef4444"][index]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales vs purchases */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="font-semibold text-slate-800">
                        Sales vs Purchases
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                        Value of completed orders
                    </p>

                    <div className="h-72 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={orderData}
                                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis dataKey="name" />

                                <YAxis
                                    tickFormatter={(value) =>
                                        `₹${Number(value).toLocaleString("en-IN")}`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />

                                <Bar
                                    dataKey="amount"
                                    fill="#2563eb"
                                    radius={[6, 6, 0, 0]}
                                    barSize={55}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">
                                Completed Sales
                            </p>
                            <p className="font-semibold text-blue-700 mt-1">
                                {formatCurrency(dashboard.totalSalesAmount)}
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">
                                Received Purchases
                            </p>
                            <p className="font-semibold text-slate-800 mt-1">
                                {formatCurrency(dashboard.totalPurchaseAmount)}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Recent stock movements */}
            <div className="bg-white border border-slate-200 rounded-xl">

                <div className="p-5 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                Recent Stock Movements
                            </h2>

                            <p className="text-xs text-slate-500 mt-1">
                                Latest inventory transactions
                            </p>
                        </div>

                        <TrendingUp size={20} className="text-slate-400" />
                    </div>
                </div>

                {movementList.length === 0 ? (
                    <div className="p-10 text-center">
                        <Package size={30} className="text-slate-300 mx-auto" />
                        <p className="text-sm text-slate-500 mt-3">
                            No stock movements found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">

                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3">SKU</th>
                                <th className="px-5 py-3">Movement</th>
                                <th className="px-5 py-3">Quantity</th>
                                <th className="px-5 py-3">Reason</th>
                                <th className="px-5 py-3">Date</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                            {movementList.map((movement) => (
                                <tr
                                    key={movement.id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        {movement.productName}
                                    </td>

                                    <td className="px-5 py-4 text-slate-500">
                                        {movement.sku}
                                    </td>

                                    <td className="px-5 py-4">
                                        {movement.movementType === "STOCK_IN" ? (
                                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
                          <ArrowDownToLine size={14} />
                          Stock In
                        </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded-md text-xs font-medium">
                          <ArrowUpFromLine size={14} />
                          Stock Out
                        </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 font-semibold text-slate-700">
                                        {movement.quantity}
                                    </td>

                                    <td className="px-5 py-4 text-slate-500 max-w-56 truncate">
                                        {movement.reason || "-"}
                                    </td>

                                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                                        {formatDate(movement.createdAt)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;

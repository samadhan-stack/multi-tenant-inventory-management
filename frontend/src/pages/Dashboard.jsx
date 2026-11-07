
import {
    Package,
    Users,
    Wallet,
    AlertTriangle,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'

const stats = [
    {
        title: 'Total Products',
        value: '--',
        description: 'Products registered',
        icon: Package,
        color: 'blue',
    },
    {
        title: 'Total Customers',
        value: '--',
        description: 'Customers registered',
        icon: Users,
        color: 'violet',
    },
    {
        title: 'Inventory Value',
        value: '--',
        description: 'Current stock valuation',
        icon: Wallet,
        color: 'emerald',
    },
    {
        title: 'Low Stock Items',
        value: '--',
        description: 'Requires attention',
        icon: AlertTriangle,
        color: 'amber',
    },
]

const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
}

function Dashboard() {
    return (
        <div className="space-y-7">

            {/* Page heading */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Welcome back! Here's what's happening with your business.
                    </p>
                </div>

                <div className="text-sm text-slate-500">
                    Business Overview
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${colorStyles[stat.color]}`}>
                                    <Icon size={21} />
                                </div>

                                <ArrowUpRight size={18} className="text-slate-300" />
                            </div>

                            <p className="mt-4 text-sm font-medium text-slate-500">
                                {stat.title}
                            </p>

                            <h2 className="mt-1 text-2xl font-bold text-slate-900">
                                {stat.value}
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                {stat.description}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Analytics section */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-800">
                                Sales Overview
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Sales performance analytics
                            </p>
                        </div>

                        <TrendingUp size={20} className="text-blue-600" />
                    </div>

                    <div className="mt-8 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                        <p className="text-sm text-slate-400">
                            Sales chart will appear here
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-slate-800">
                        Stock Alerts
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Products requiring attention
                    </p>

                    <div className="mt-8 flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                        <p className="text-sm text-slate-400">
                            Stock alerts will appear here
                        </p>
                    </div>
                </div>
            </div>

            {/* Recent activity */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-800">
                    Recent Stock Movements
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                    Latest inventory transactions
                </p>

                <div className="mt-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                    <p className="text-sm text-slate-400">
                        Recent movements will appear here
                    </p>
                </div>
            </div>

        </div>
    )
}

export default Dashboard

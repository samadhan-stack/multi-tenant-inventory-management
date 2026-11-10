
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    Truck,
    ShoppingCart,
    Receipt,
    Warehouse,
    Boxes,
    X
} from 'lucide-react'
import { useAuth } from "../../context/AuthContext";

const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
    { name: 'Sales Orders', path: '/sales-orders', icon: Receipt },
    { name: 'Inventory', path: '/inventory', icon: Warehouse },
    { name: 'Users', path: '/users', icon: Users, adminOnly: true },
]

function Sidebar({ isOpen, onClose }) {

    const { user } = useAuth();

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-slate-300 transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Boxes size={21} />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-wide text-white">
                                INVENTORY ERP
                            </h1>
                            <p className="text-[10px] text-slate-400">
                                Management System
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-4 pt-7 pb-3">
                    <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        Workspace
                    </p>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3">
                    {navigation.map((item) => {
                        const Icon = item.icon

                        if (item.adminOnly && user?.role !== "ADMIN") {
                            return null;
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <Icon size={18} strokeWidth={1.8} />
                                {item.name}
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <p className="text-xs text-slate-500">Inventory ERP</p>
                    <p className="mt-1 text-[11px] text-slate-600">
                        Version 1.0.0
                    </p>
                </div>
            </aside>
        </>
    )
}

export default Sidebar

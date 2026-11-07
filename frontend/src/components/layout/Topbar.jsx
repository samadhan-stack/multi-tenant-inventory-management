
import { Bell, Search, Menu, LogOut, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">

            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="md:hidden text-slate-600 hover:text-slate-900"
                >
                    <Menu size={22} />
                </button>

                <div className="hidden sm:flex items-center relative">
                    <Search
                        size={17}
                        className="absolute left-3 text-slate-400"
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm w-64 outline-none focus:border-blue-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">

                <button className="relative text-slate-500 hover:text-slate-800">
                    <Bell size={20} />
                </button>

                <div className="h-8 w-px bg-slate-200"></div>

                <div className="flex items-center gap-2">
                    <UserCircle size={30} className="text-blue-600" />

                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-800">
                            {user?.email || "User"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.role || "STAFF"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="text-slate-500 hover:text-red-600 transition-colors"
                >
                    <LogOut size={19} />
                </button>

            </div>
        </header>
    );
}

export default Topbar;

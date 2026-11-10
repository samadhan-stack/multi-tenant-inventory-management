
import { useState } from "react";
import { Package, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate, useNavigate } from "react-router-dom";

function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
                        <Package size={30} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Inventory Management
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Sign in to access your workspace
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">

                    <h2 className="text-xl font-semibold text-slate-800">
                        Welcome back
                    </h2>

                    <p className="text-sm text-slate-500 mt-1 mb-6">
                        Enter your account details below.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>

                            <div className="relative">
                                <Mail
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <div className="relative">
                                <Lock
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg py-3 text-sm transition-colors"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        New to Inventory ERP?{" "}
                        <Link
                            to="/register"
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Create company account
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    Multi-Tenant Inventory Management System
                </p>

            </div>
        </div>
    );
}

export default Login;

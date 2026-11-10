import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Package, Building2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Register() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [companyName, setCompanyName] = useState("");
    const [fullName, setFullName] = useState("");
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
            await register(
                companyName.trim(),
                fullName.trim(),
                email.trim(),
                password
            );

            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full border border-slate-300 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-7">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
                        <Package size={30} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">
                        Inventory Management
                    </h1>

                    <p className="text-sm text-slate-500 mt-2">
                        Create your company workspace
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <h2 className="text-xl font-semibold text-slate-800">
                        Create an account
                    </h2>

                    <p className="text-sm text-slate-500 mt-1 mb-6">
                        Your account will have Administrator access.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Company Name
                            </label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Your company name"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Administrator Name
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@company.com"
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    required
                                    className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg py-3 text-sm"
                        >
                            {loading ? "Creating workspace..." : "Create Company Account"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, Mail, Lock, Eye, EyeOff, Github, Chrome, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { auth, googleProvider } from "../lib/firebaseClient";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { API_BASE } from "../lib/apiClient";

function normalizeAuthError(err) {
    const code = String(err?.code || "").toLowerCase();
    const message = String(err?.message || "");

    if (
        code === "auth/unauthorized-domain" ||
        message.includes("Illegal url for new iframe")
    ) {
        return "Google Sign-In is not authorized for this domain yet. Add your Vercel domain under Firebase Authentication → Settings → Authorized domains.";
    }

    return message || "Authentication failed";
}

export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Forgot Password States
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState("");
    const [resetError, setResetError] = useState("");

    const router = useRouter();

    const apiBase = API_BASE;

    async function syncUserWithBackend(user) {
        try {
            await fetch(`${apiBase}/api/auth/sync-user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    provider: user.providerData?.[0]?.providerId,
                    photoURL: user.photoURL,
                }),
            });
        } catch (err) {
            console.error("Failed to sync user with backend", err);
        }
    }

    const handleEmailSignIn = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await syncUserWithBackend(cred.user);
            sessionStorage.setItem("showWelcome", "1");
            router.push("/");
        } catch (err) {
            console.error("Email sign in error", err);
            setError(err.message || "Failed to sign in");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) {
            setResetError("Please enter your email address.");
            return;
        }

        setResetLoading(true);
        setResetError("");
        setResetSuccess("");

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSuccess("Password reset link sent! Please check your inbox.");
            setTimeout(() => {
                setShowResetModal(false);
                setResetSuccess("");
                setResetEmail("");
            }, 3000);
        } catch (err) {
            console.error("Password reset error:", err);
            setResetError(err.message || "Failed to send reset email.");
        } finally {
            setResetLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            const cred = await signInWithPopup(auth, googleProvider);
            await syncUserWithBackend(cred.user);
            sessionStorage.setItem("showWelcome", "1");
            router.push("/");
        } catch (err) {
            console.error("Google sign in error", err);
            setError(normalizeAuthError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfdfe] flex flex-col lg:flex-row relative">
            {/* Fixed Back Button */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-[100] flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group"
            >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold text-slate-900">Back</span>
            </Link>

            {/* Left Side - Hero/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-16 animate-slide-in-left">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 group w-fit">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white premium-shadow transition-transform group-hover:rotate-6">
                            <Rocket className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">
                            SkillMatch<span className="text-indigo-400">AI</span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10">
                    <h1 className="text-5xl font-black text-white leading-tight mb-6">
                        Welcome back to the <br />
                        <span className="text-indigo-400">future of work.</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Sign in to access your personalized job matches, track applications, and manage your professional profile.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                            +50k
                        </div>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Join 50,000+ professionals finding their dream roles.</p>
                </div>

                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-full h-full">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]"></div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative animate-slide-in-right">
                <div className="w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Sign In</h2>
                        <p className="text-slate-500 font-medium">Enter your credentials to continue</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleEmailSignIn}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResetModal(true);
                                        setResetEmail(email); // Pre-fill if they already typed something
                                    }}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 font-medium">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="my-10 flex items-center gap-4">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-slate-700 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Chrome className="w-5 h-5" /> Google
                        </button>
                        <button
                            type="button"
                            disabled
                            className="flex items-center justify-center gap-3 py-4 border border-slate-100 rounded-2xl text-slate-400 cursor-not-allowed"
                        >
                            <Github className="w-5 h-5" /> GitHub
                        </button>
                    </div>

                    <p className="mt-10 text-center text-slate-600 font-medium">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="text-indigo-600 font-bold hover:underline underline-offset-4">
                            Create one for free
                        </Link>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowResetModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                <Lock className="w-7 h-7 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Enter your email and we&apos;ll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>
                            </div>

                            {resetError && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {resetError}
                                </div>
                            )}

                            {resetSuccess && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    {resetSuccess}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {resetLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowResetModal(false)}
                                className="w-full py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

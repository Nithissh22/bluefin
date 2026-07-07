"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { fetchApi } from "@/lib/api";
import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
    const { login } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [portalName, setPortalName] = useState("OMS Platform");

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const role = searchParams.get("role");
        
        if (role === "admin") {
            setEmail("admin@bluefin.com");
            setPassword("password123");
            setPortalName("Admin Panel");
        } else if (role === "staff") {
            setEmail("staff1@bluefin.com");
            setPassword("password123");
            setPortalName("Staff Portal");
        } else if (role === "client") {
            setPortalName("Client Portal");
        }
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            let token = "";
            
            if (isRegistering) {
                // Registration Flow
                const response = await fetchApi("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ name, email, password })
                });
                token = response.access_token;
            } else {
                // Login Flow
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);
                
                const response = await fetchApi("/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData.toString()
                });
                token = response.access_token;
            }
            
            // fetch user details with the token
            const userResponse = await fetchApi("/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            login(token, userResponse);
            
            // Route based on role
            if (userResponse.role === "admin") window.location.href = "/admin-panel/dashboard";
            else if (userResponse.role === "staff") window.location.href = "/staff-portal/orders";
            else window.location.href = "/client-portal/products";
            
        } catch (err: any) {
            setError(err.message || (isRegistering ? "Registration failed." : "Invalid credentials."));
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex w-full bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
            {/* Left Side - Branding / Graphic */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden flex-col justify-between p-12">
                <Image 
                    src="/clinical_login.png" 
                    alt="Clinical Login Abstract" 
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020814]/80 via-transparent to-transparent"></div>
                
                <div className="relative z-10 flex items-center gap-3 text-white">
                    <div className="w-10 h-10 rounded bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl text-white border border-white/30">B</div>
                    <span className="text-xl font-medium tracking-tight text-white drop-shadow-md">Bluefin Bio Science</span>
                </div>
                
                <div className="relative z-10 max-w-md mt-auto">
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-mono uppercase tracking-widest shadow-lg">
                        System Auth // v2.0
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                        {portalName}
                    </h1>
                    <p className="text-white/80 text-lg leading-relaxed font-light drop-shadow-md">
                        Securely authenticate to access procurement ledgers, manage fulfillment logistics, and track high-priority orders.
                    </p>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-background">
                <Link href="/" className="absolute top-8 right-8 text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                    &larr; Modules
                </Link>

                <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-medium text-foreground mb-2">
                            {isRegistering ? "Create Account" : "Sign In"}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {isRegistering 
                                ? "Enter your details to register as a new client." 
                                : "Please enter your credentials to authenticate."}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex bg-muted p-1 rounded-lg mb-8">
                        <button 
                            type="button"
                            onClick={() => { setIsRegistering(false); setError(""); }}
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${!isRegistering ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsRegistering(true); setError(""); }}
                            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${isRegistering ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-lg border border-destructive/20 flex items-center gap-2">
                                {error}
                            </div>
                        )}
                        
                        {isRegistering && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-sm"
                                        placeholder="e.g. Acme Labs"
                                        required={isRegistering}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all text-sm"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground flex justify-between">
                                Password
                                {!isRegistering && <a href="#" className="text-primary hover:underline text-xs">Forgot?</a>}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all font-mono tracking-widest text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isRegistering ? "Create Account" : "Authenticate"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

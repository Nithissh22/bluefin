"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/lib/CartContext";
import { ShoppingCart, LogOut, PackageSearch, ShieldCheck, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import AIChatWidget from "@/components/AIChatWidget";

function ClientNavigation() {
    const { items } = useCart();
    const pathname = usePathname();
    const { logout } = useAuth();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const navLinks = [
        { name: "Catalog", path: "/client-portal/products" },
        { name: "My Orders", path: "/client-portal/my-orders" }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/client-portal/products" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300">
                        <PackageSearch className="w-5 h-5" />
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-lg font-black tracking-tight text-slate-900 leading-none">BLUEFIN</h2>
                        <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">Bio Science</span>
                    </div>
                </Link>
                
                <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                    {navLinks.map((link) => {
                        const isActive = pathname.includes(link.path);
                        return (
                            <Link key={link.name} href={link.path} className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 z-10 ${isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}>
                                {isActive && (
                                    <motion.div 
                                        layoutId="clientNavIndicator"
                                        className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50 -z-10"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/client-portal/cart" className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors group border border-slate-200/50">
                        <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <AnimatePresence>
                            {itemCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    exit={{ scale: 0 }}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-md border-2 border-white"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                    
                    <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>
                    
                    <button onClick={logout} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-full transition-all duration-300 text-sm font-bold shadow-sm hover:shadow">
                        <span className="hidden sm:inline">Sign Out</span> <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

function ClientFooter() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 relative z-10 mt-auto">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg shadow-md">
                            <PackageSearch className="w-4 h-4" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900">BLUEFIN</h2>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mb-6">
                        Providing cutting-edge laboratory instruments, reagents, and infrastructure designed for absolute precision and reliability in modern research.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-full w-fit border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" /> Secure Procurement Platform
                    </div>
                </div>
                
                <div>
                    <h4 className="text-slate-900 font-bold mb-6">Quick Links</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li><Link href="/client-portal/products" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">Catalog <ExternalLink className="w-3 h-3"/></Link></li>
                        <li><Link href="/client-portal/my-orders" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">Order Tracking <ExternalLink className="w-3 h-3"/></Link></li>
                        <li><a href="#" className="hover:text-blue-600 transition-colors">Support Center</a></li>
                        <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-slate-900 font-bold mb-6">Contact</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500">
                        <li className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <span>procurement@bluefin.bio<br/>support@bluefin.bio</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <span>+1 (800) 555-0199<br/>Mon-Fri, 9AM-6PM EST</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <span>100 Science Park Drive<br/>Innovation District, MA 02142</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
                <p>© {new Date().getFullYear()} Bluefin Bio Science. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Compliance</a>
                </div>
            </div>
        </footer>
    );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
    return (
        <CartProvider>
            {/* Force a light, clinical background globally for the client portal */}
            <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans relative">
                
                <ClientNavigation />
                
                <main className="flex-1 w-full mx-auto relative px-6 max-w-7xl pt-32 pb-24 z-10">
                    {children}
                </main>
                
                <AIChatWidget />

                <ClientFooter />
            </div>
        </CartProvider>
    );
}

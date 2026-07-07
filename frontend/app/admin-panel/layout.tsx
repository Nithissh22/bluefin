"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogOut, LayoutDashboard, Users, Box, ShoppingCart, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { logout, user } = useAuth();
    const pathname = usePathname();
    
    return (
        <div className="min-h-screen flex bg-background text-foreground">
            {/* Enterprise Dark Sidebar */}
            <aside className="w-64 shrink-0 bg-[#0F172A] text-slate-300 border-r border-[#1E293B] p-6 flex flex-col gap-6 shadow-2xl sticky top-0 h-screen z-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg shrink-0">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-tight">Admin Console</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Global Root Access</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1 flex-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2 px-3">Management</span>
                    
                    <Link href="/admin-panel/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.includes('dashboard') ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <LayoutDashboard className="w-4 h-4 shrink-0" /> Executive Dashboard
                    </Link>
                    <Link href="/admin-panel/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.includes('users') ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <Users className="w-4 h-4 shrink-0" /> User Governance
                    </Link>
                    <Link href="/admin-panel/products" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.includes('products') ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <Box className="w-4 h-4 shrink-0" /> Master Catalog
                    </Link>
                    <Link href="/admin-panel/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${pathname.includes('orders') ? 'bg-blue-600/10 text-blue-400 font-semibold' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <ShoppingCart className="w-4 h-4 shrink-0" /> Order Control
                    </Link>
                </nav>

                <div className="mt-auto border-t border-slate-800 pt-6">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                            {user?.name?.substring(0,2).toUpperCase() || 'AD'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@bluefin.com'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <header className="h-16 flex items-center justify-end px-8 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-border text-foreground rounded-full transition-all duration-300 text-xs font-semibold group">
                        <LogOut className="w-3.5 h-3.5 group-hover:text-red-500" /> Secure Sign Out
                    </button>
                </header>
                <main className="flex-1 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}

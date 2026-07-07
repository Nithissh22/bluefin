"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default function StaffLayout({ children }: { children: ReactNode }) {
    const { logout } = useAuth();
    
    return (
        <div className="min-h-screen flex bg-background text-foreground">
            <aside className="w-64 shrink-0 bg-card border-r border-border p-6 flex flex-col gap-4 shadow-sm sticky top-0 h-screen">
                <h2 className="text-xl font-bold text-accent mb-6">Staff Portal</h2>
                <nav className="flex flex-col gap-2">
                    <Link href="/staff-portal/orders" className="px-3 py-2 rounded hover:bg-muted font-medium transition-colors">My Orders</Link>
                    <Link href="/staff-portal/products" className="px-3 py-2 rounded hover:bg-muted font-medium transition-colors">Products</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <header className="h-16 flex items-center justify-end px-8 border-b border-border/50 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
                    <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-full transition-all duration-300 text-xs font-semibold">
                        <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                </header>
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

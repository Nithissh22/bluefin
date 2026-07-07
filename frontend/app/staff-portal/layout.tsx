"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogOut, Menu, X, Package, ShoppingCart } from "lucide-react";

export default function StaffLayout({ children }: { children: ReactNode }) {
    const { logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close menu when route changes on mobile
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);
    
    return (
        <div className="min-h-screen flex bg-background text-foreground relative">
            
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                />
            )}

            <aside className={`w-64 shrink-0 bg-card border-r border-border p-6 flex flex-col gap-4 shadow-sm fixed md:sticky top-0 h-screen z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-accent">Staff Portal</h2>
                    <button 
                        className="md:hidden text-foreground/50 hover:text-foreground p-1 rounded-md bg-muted transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    <Link href="/staff-portal/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-colors ${pathname.includes('orders') ? 'bg-accent/10 text-accent' : 'hover:bg-muted'}`}>
                        <ShoppingCart className="w-4 h-4 shrink-0" /> My Orders
                    </Link>
                    <Link href="/staff-portal/products" className={`flex items-center gap-3 px-3 py-2.5 rounded font-medium transition-colors ${pathname.includes('products') ? 'bg-accent/10 text-accent' : 'hover:bg-muted'}`}>
                        <Package className="w-4 h-4 shrink-0" /> Products
                    </Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full">
                <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
                    <div className="flex items-center gap-3 md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)} 
                            className="p-2 -ml-2 text-foreground/70 hover:text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-end w-full md:w-auto">
                        <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-full transition-all duration-300 text-xs font-semibold">
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

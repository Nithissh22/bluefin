"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Boxes, Search } from "lucide-react";

export default function StaffProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { user } = useAuth();
    
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchApi("/staff/products")
        .then(data => {
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user]);

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) {
        return <div className="py-24 text-center">Please sign in as Staff.</div>;
    }

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4">
            <div className="mb-10 border-b border-border/50 pb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent rounded-xl -z-10 blur-xl"></div>
                <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight flex items-center gap-3">
                    <Boxes className="w-8 h-8 text-accent" /> Inventory View
                </h1>
                <p className="text-muted-foreground text-lg">
                    Check bio-science equipment stock levels and availability.
                </p>
                
                <div className="mt-6 max-w-md relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-background border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                </div>
            </div>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground">
                    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                    <span className="font-medium animate-pulse">Loading inventory...</span>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 text-foreground font-semibold border-b border-border/60">
                                <tr>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4 text-right">Stock Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{p.category}</td>
                                            <td className="px-6 py-4 text-muted-foreground">${p.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    p.stock > 10 ? 'bg-green-100 text-green-800 border border-green-200' :
                                                    p.stock > 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    {p.stock} units
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            No products found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

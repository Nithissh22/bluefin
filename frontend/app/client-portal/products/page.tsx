"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/CartContext";
import { ShoppingCart, Search, Filter, Sparkles, Activity, CheckCircle2, ChevronRight, Box } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { motion, AnimatePresence } from "framer-motion";
import BioBackground from "@/components/BioBackground";

// Helper for beautiful algorithmic gradients based on product ID
const generateGradient = (id: string) => {
    const colors = [
        ['from-blue-100 to-indigo-50', 'text-blue-600'],
        ['from-emerald-100 to-teal-50', 'text-emerald-600'],
        ['from-sky-100 to-cyan-50', 'text-sky-600'],
        ['from-purple-100 to-fuchsia-50', 'text-purple-600'],
        ['from-slate-200 to-slate-100', 'text-slate-600']
    ];
    // simple hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function ClientProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    
    const { user } = useAuth();
    const { addToCart } = useCart();
    
    // Quick notification state for add to cart
    const [addedItemId, setAddedItemId] = useState<string | null>(null);
    
    useEffect(() => {
        setLoading(true);
        fetchApi("/client/products")
        .then(data => {
            if (Array.isArray(data)) {
                setProducts(data);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setError("Failed to load products.");
            setLoading(false);
        });
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [products]);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = (p: any) => {
        addToCart(p);
        setAddedItemId(p.id);
        setTimeout(() => setAddedItemId(null), 2000);
    };

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="pb-24 animate-in fade-in duration-700 relative z-10">
            <BioBackground />

            {/* Premium Hero Section */}
            <div className="pt-16 mb-12 relative flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 shadow-sm text-xs font-bold tracking-[0.1em] mb-6 uppercase">
                    <Sparkles className="w-3.5 h-3.5" /> Clinical Procurement Portal
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight drop-shadow-sm max-w-3xl leading-tight">
                    Precision Instruments & <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">Reagents Catalog</span>
                </h1>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed mb-10">
                    Source industry-leading biological equipment, diagnostic kits, and laboratory infrastructure with secure, audited fulfillment.
                </p>
                
                <div className="w-full max-w-2xl relative group shadow-xl shadow-blue-900/5 rounded-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search for pipettes, microscopes, buffers..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-lg font-medium placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Category Pills */}
            {!loading && !error && categories.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
            
            {loading ? (
                <LoadingScreen fullScreen={false} />
            ) : error ? (
                <div className="text-center py-24 text-red-600 bg-red-50 rounded-2xl border border-red-100 font-medium flex flex-col items-center">
                    <Activity className="w-12 h-12 mb-4 text-red-400" />
                    {error}
                </div>
            ) : (
                <motion.div 
                    variants={container} 
                    initial="hidden" 
                    animate="show" 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    {filteredProducts.length > 0 ? filteredProducts.map((p: any) => {
                        const [gradBg, gradText] = generateGradient(p.id);
                        const isAdded = addedItemId === p.id;
                        
                        return (
                            <motion.div variants={item} key={p.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                                
                                {/* Image / Gradient Placeholder */}
                                <div className={`aspect-[4/3] w-full relative overflow-hidden bg-gradient-to-br ${gradBg} border-b border-slate-100 flex items-center justify-center p-6`}>
                                    {p.image_url ? (
                                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                    ) : (
                                        <div className="relative z-10 text-center flex flex-col items-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                            <Box className={`w-16 h-16 mb-4 ${gradText} drop-shadow-sm`} strokeWidth={1.5} />
                                            <div className={`text-xs font-bold uppercase tracking-widest ${gradText} opacity-70`}>{p.category}</div>
                                        </div>
                                    )}
                                    {/* Category Badge */}
                                    <span className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm border border-slate-200/50 text-slate-800 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                        {p.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-1 relative z-20">
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{p.name}</h3>
                                    <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2 leading-relaxed">{p.description || "High-precision laboratory equipment. Full technical specifications available on request."}</p>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Unit Price</div>
                                            <div className="text-2xl font-black text-slate-900 tracking-tight">${p.price.toFixed(2)}</div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleAddToCart(p)}
                                            disabled={isAdded}
                                            className={`relative overflow-hidden flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                                                isAdded ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                                                : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/30 active:scale-95'
                                            }`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isAdded ? (
                                                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                                        <ShoppingCart className="w-5 h-5" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
                            <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Equipment Found</h3>
                            <p className="text-slate-500 font-medium">Try adjusting your search criteria or category filter.</p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

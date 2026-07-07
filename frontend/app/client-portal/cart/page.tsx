"use client";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper for algorithmic gradients matching the catalog
const generateGradient = (id: string) => {
    const colors = [
        ['from-blue-100 to-indigo-50', 'text-blue-600'],
        ['from-emerald-100 to-teal-50', 'text-emerald-600'],
        ['from-sky-100 to-cyan-50', 'text-sky-600'],
        ['from-purple-100 to-fuchsia-50', 'text-purple-600'],
        ['from-slate-200 to-slate-100', 'text-slate-600']
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function CartPage() {
    const { items, updateQuantity, removeFromCart, total } = useCart();

    if (items.length === 0) {
        return (
            <div className="py-32 text-center max-w-xl mx-auto">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-200">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">Ready to equip your lab? Browse our professional catalog for precision instruments and reagents.</p>
                <Link href="/client-portal/products">
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white transition-all rounded-full font-bold shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2 mx-auto">
                        Browse Catalog <ArrowRight className="w-4 h-4" />
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="pb-16 pt-6 animate-in fade-in duration-500 relative z-10">
            <div className="mb-10 pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Procurement Cart</h1>
                    <p className="text-slate-500 font-medium">Review your items before proceeding to secure checkout.</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" /> SSL Secured
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="hidden sm:grid grid-cols-12 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <div className="col-span-6">Item</div>
                            <div className="col-span-3 text-center">Quantity</div>
                            <div className="col-span-3 text-right">Subtotal</div>
                        </div>
                        
                        <div className="divide-y divide-slate-100 p-6">
                            <AnimatePresence>
                                {items.map((item) => {
                                    const [gradBg, gradText] = generateGradient(item.product.id);
                                    
                                    return (
                                        <motion.div 
                                            key={item.product.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-6 first:pt-0 last:pb-0"
                                        >
                                            <div className="col-span-1 sm:col-span-6 flex gap-5 items-center">
                                                <div className={`w-24 h-24 bg-gradient-to-br ${gradBg} rounded-xl flex-shrink-0 overflow-hidden border border-slate-200/50 flex items-center justify-center relative`}>
                                                    {item.product.image_url ? (
                                                        <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover opacity-90" />
                                                    ) : (
                                                        <Box className={`w-8 h-8 ${gradText} opacity-80`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.product.name}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{item.product.category}</p>
                                                    <button onClick={() => removeFromCart(item.product.id)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">
                                                        <Trash2 className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 w-fit">
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-200">
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-end">
                                                <span className="font-black text-slate-900 text-lg tracking-tight">
                                                    ${(item.product.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                
                <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sticky top-28">
                        <h2 className="font-bold text-2xl tracking-tight mb-6 text-slate-900">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Subtotal ({items.length} items)</span>
                                <span className="text-slate-900 font-bold">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Fulfillment & Handling</span>
                                <span className="text-slate-900 font-bold">Calculated next step</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Estimated Tax</span>
                                <span className="text-slate-900 font-bold">TBD</span>
                            </div>
                            
                            <div className="border-t border-slate-200 pt-6 mt-6">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Estimated</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">${total.toFixed(2)}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 text-right uppercase tracking-wider">USD (Excl. Tax & Shipping)</p>
                            </div>
                        </div>
                        <Link href="/client-portal/checkout" className="block w-full">
                            <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all active:scale-95">
                                Proceed to Checkout <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

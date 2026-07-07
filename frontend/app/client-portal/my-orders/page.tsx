"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Package, Truck, Clock, ReceiptText, FileText, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function MyOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    // Order Manifest Modal State
    const [manifestModal, setManifestModal] = useState<any | null>(null);

    useEffect(() => {
        if (!user) return;
        
        setLoading(true);
        fetchApi("/client/orders")
        .then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user]);

    if (!user) {
        return (
            <div className="py-24 text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
                <p className="text-slate-500 font-medium">Please sign in to view your secure orders.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'confirmed': return 'bg-sky-100 text-sky-700 border-sky-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'packing': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'ready_to_ship': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="pb-16 pt-6 animate-in fade-in duration-500 relative z-10">
            <div className="mb-12 border-b border-slate-200 pb-6 relative">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <Package className="w-6 h-6 text-white" />
                    </div>
                    Procurement History
                </h1>
                <p className="text-slate-500 text-lg font-medium mt-4">
                    Track and review the status of your secure bio-science equipment orders.
                </p>
            </div>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6 text-slate-500">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="font-bold tracking-widest text-xs uppercase animate-pulse">Retrieving secure logs...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders && orders.length > 0 ? (
                        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                        {orders.map((order: any) => (
                            <motion.div variants={itemVariant} key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 group overflow-hidden relative">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-4 mb-2">
                                            <h3 className="font-black text-slate-900 text-2xl tracking-tight">Order #{order.id.split("-")[0].toUpperCase()}</h3>
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                                                {order.status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" /> Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Unknown"}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right flex flex-col justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</div>
                                            <div className="font-black text-3xl text-slate-900 tracking-tight">${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</div>
                                        </div>
                                        <div className="mt-4 md:mt-2">
                                            <button 
                                                onClick={() => setManifestModal(order)}
                                                className="px-5 py-2.5 bg-slate-50 text-slate-700 hover:text-blue-600 border border-slate-200 hover:border-blue-600 hover:bg-white transition-all rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit md:ml-auto group/btn shadow-sm"
                                            >
                                                <ReceiptText className="w-4 h-4 group-hover/btn:text-blue-600 transition-colors" /> View Manifest
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                    
                                {/* Visual Tracker Line */}
                                <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Truck className="w-4 h-4 text-blue-600" /> Fulfillment Progress
                                        </h4>
                                        <div className="text-xs text-slate-500 font-medium">
                                            <span className="font-bold text-slate-900">Est. Delivery:</span> {order.createdAt ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : "Unknown"}
                                        </div>
                                    </div>
                                    
                                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ 
                                                width: order.status === 'PENDING' ? '10%' : 
                                                       order.status === 'CONFIRMED' ? '25%' :
                                                       order.status === 'PROCESSING' ? '40%' :
                                                       order.status === 'PACKING' ? '55%' :
                                                       order.status === 'READY_TO_SHIP' ? '70%' :
                                                       order.status === 'SHIPPED' ? '85%' :
                                                       order.status === 'DELIVERED' ? '100%' : '0%'
                                            }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                            className="absolute top-0 left-0 h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                                        >
                                        </motion.div>
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <span className={['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-slate-900' : ''}>Received</span>
                                        <span className={['PROCESSING', 'PACKING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-slate-900 hidden sm:inline' : 'hidden sm:inline'}>Processing</span>
                                        <span className={['SHIPPED', 'DELIVERED'].includes(order.status) ? 'text-slate-900' : ''}>Shipped</span>
                                        <span className={order.status === 'DELIVERED' ? 'text-emerald-600 font-black' : ''}>Delivered</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </motion.div>
                    ) : (
                        <div className="py-32 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                <Package className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Active Orders</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">You haven't placed any procurement requests yet.</p>
                            <Link href="/client-portal/products" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all inline-block active:scale-95">
                                Start Browsing Catalog
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Order Manifest Modal */}
            <AnimatePresence>
                {manifestModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setManifestModal(null)}></motion.div>
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[85vh] overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-xl flex items-center gap-3 text-slate-900 tracking-tight">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        Official Manifest
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-widest font-bold">Trace ID: {manifestModal.id}</p>
                                </div>
                                <button onClick={() => setManifestModal(null)} className="text-slate-400 hover:text-slate-900 hover:bg-slate-200 p-2 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Fulfillment Target</p>
                                        <p className="font-bold text-slate-900 text-sm">{manifestModal.clientName || manifestModal.clientId || "Client Account"}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Current Status</p>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(manifestModal.status)}`}>
                                            {manifestModal.status.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Authorized Items
                                </h4>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-5 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest">SKU / Designation</th>
                                                <th className="px-5 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-5 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Unit Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {manifestModal.items && manifestModal.items.length > 0 ? (
                                                manifestModal.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-5 py-4 font-bold text-slate-900">{item.name || item.productId || 'Unknown Item'}</td>
                                                        <td className="px-5 py-4 text-center font-mono text-slate-600">{item.quantity}</td>
                                                        <td className="px-5 py-4 text-right font-mono font-medium text-slate-600">${(item.price || item.priceAtOrder || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-5 py-8 text-center text-slate-400 font-medium">No detailed item logs attached.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-slate-900 border-t border-slate-900">
                                            <tr>
                                                <td colSpan={2} className="px-5 py-4 font-bold text-right uppercase tracking-widest text-[10px] text-slate-300">Total Authorized Amount:</td>
                                                <td className="px-5 py-4 font-black font-mono text-right text-lg text-white tracking-tight">
                                                    ${(manifestModal.totalAmount || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

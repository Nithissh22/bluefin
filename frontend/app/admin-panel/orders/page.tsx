"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { ShoppingCart, Filter, Search, UserCheck, X, FileText, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STATUS_STAGES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'];

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    
    // Bulk Selection State
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [bulkAssignTarget, setBulkAssignTarget] = useState<string>('');

    const [orderDetailModal, setOrderDetailModal] = useState<any | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        Promise.all([
            fetchApi("/admin/orders"),
            fetchApi("/admin/users")
        ]).then(([ordersData, usersData]) => {
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            if (Array.isArray(usersData)) {
                setStaffList(usersData.filter(u => u.role === 'staff' || u.role === 'admin'));
            }
            setLoading(false);
        }).catch(console.error);
    };

    const handleAssign = async (orderId: string, staffId: string) => {
        if (!staffId) return;
        try {
            await fetchApi(`/admin/orders/${orderId}/assign`, {
                method: "POST",
                body: JSON.stringify({ staff_id: staffId })
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedStaffId: staffId } : o));
        } catch (e: any) {
            alert(e.message || "Failed to assign staff");
        }
    };

    const handleBulkAssign = async () => {
        if (!bulkAssignTarget || selectedOrders.length === 0) return;
        
        try {
            // In a real app this would be a single bulk API endpoint.
            await Promise.all(selectedOrders.map(orderId => 
                fetchApi(`/admin/orders/${orderId}/assign`, {
                    method: "POST",
                    body: JSON.stringify({ staff_id: bulkAssignTarget })
                }).catch(() => null)
            ));
            
            setOrders(prev => prev.map(o => selectedOrders.includes(o.id) ? { ...o, assignedStaffId: bulkAssignTarget } : o));
            setSelectedOrders([]);
            setBulkAssignTarget('');
        } catch (e) {
            alert("Partial failure during bulk assignment");
        }
    };

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

    const processedOrders = useMemo(() => {
        return orders
            .filter(order => activeTab === 'ALL' || order.status === activeTab)
            .filter(order => {
                const query = searchQuery.toLowerCase();
                return order.id.toLowerCase().includes(query) || (order.clientName || "").toLowerCase().includes(query);
            })
            .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
    }, [orders, activeTab, searchQuery]);

    const toggleAllSelection = () => {
        if (selectedOrders.length === processedOrders.length && processedOrders.length > 0) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(processedOrders.map(o => o.id));
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-500 max-w-[100rem] mx-auto">
            
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                        Master Order Control
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">Global oversight of all procurement and fulfillment records.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card text-foreground border border-border shadow-sm hover:bg-muted transition-all text-xs font-bold uppercase tracking-widest">
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Global Toolbar */}
            <div className="bg-card border border-border rounded-t-xl p-3 flex flex-col md:flex-row gap-4 items-center justify-between mt-4">
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('ALL')}
                        className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                        All ({orders.length})
                    </button>
                    {STATUS_STAGES.map(stage => (
                        <button 
                            key={stage}
                            onClick={() => setActiveTab(stage)}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === stage ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                        >
                            {stage.replace(/_/g, " ")}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search ID or Client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-background border border-border focus:border-primary rounded-md text-sm outline-none transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* High-Density Data Grid */}
            <div className="bg-card border-x border-b border-border rounded-b-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-primary"
                                        checked={selectedOrders.length === processedOrders.length && processedOrders.length > 0}
                                        onChange={toggleAllSelection}
                                    />
                                </th>
                                <th className="px-4 py-3 font-bold tracking-wider uppercase text-[10px]">Order ID</th>
                                <th className="px-4 py-3 font-bold tracking-wider uppercase text-[10px]">Client Target</th>
                                <th className="px-4 py-3 font-bold tracking-wider uppercase text-[10px]">System Status</th>
                                <th className="px-4 py-3 font-bold tracking-wider uppercase text-[10px]">Created (UTC Local)</th>
                                <th className="px-4 py-3 font-bold tracking-wider uppercase text-[10px]">Fulfillment Owner</th>
                                <th className="px-4 py-3 text-right font-bold tracking-wider uppercase text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                                        Fetching system records...
                                    </td>
                                </tr>
                            ) : processedOrders.length > 0 ? (
                                processedOrders.map(o => {
                                    const isSelected = selectedOrders.includes(o.id);
                                    return (
                                        <tr key={o.id} className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                                            <td className="px-4 py-2">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-3.5 h-3.5 rounded border-border cursor-pointer accent-primary"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelection(o.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-2 font-mono font-medium text-foreground">
                                                #{o.id.split('-')[0].toUpperCase()}
                                            </td>
                                            <td className="px-4 py-2 font-medium">
                                                {o.clientName || o.clientId?.split("-")[0] || "Unknown"}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(o.status)}`}>
                                                    {o.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-muted-foreground tabular-nums">
                                                {o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleString(undefined, {
                                                    month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                                                }) : "N/A"}
                                            </td>
                                            <td className="px-4 py-2">
                                                <select 
                                                    className="bg-transparent border border-transparent hover:border-border hover:bg-muted focus:bg-background focus:border-primary rounded px-2 py-1 text-xs w-48 outline-none cursor-pointer transition-all"
                                                    value={o.assignedStaffId || ""}
                                                    onChange={(e) => handleAssign(o.id, e.target.value)}
                                                >
                                                    <option value="" disabled>Unassigned Pool</option>
                                                    {staffList.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button 
                                                    onClick={() => setOrderDetailModal(o)}
                                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors" 
                                                    title="View Details"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                        No records match the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sticky Bulk Action Bar */}
            <AnimatePresence>
                {selectedOrders.length > 0 && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 ml-32 z-50 bg-[#0F172A] text-white shadow-2xl rounded-xl px-5 py-3 flex items-center gap-5 border border-slate-700"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white font-mono text-xs font-bold rounded-md">
                                {selectedOrders.length}
                            </span>
                            <span className="text-sm font-medium whitespace-nowrap">Records Selected</span>
                        </div>
                        
                        <div className="w-px h-6 bg-slate-700"></div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Bulk Re-assign:</span>
                            <select 
                                className="bg-slate-800 border border-slate-600 text-sm rounded px-3 py-1.5 outline-none focus:border-blue-500 w-48"
                                value={bulkAssignTarget}
                                onChange={(e) => setBulkAssignTarget(e.target.value)}
                            >
                                <option value="" disabled>Select Staff...</option>
                                {staffList.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleBulkAssign}
                                disabled={!bulkAssignTarget}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                            >
                                Execute <UserCheck className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        
                        <button onClick={() => setSelectedOrders([])} className="p-1.5 hover:bg-slate-800 rounded ml-2 transition-colors text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Detail Modal */}
            <AnimatePresence>
                {orderDetailModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOrderDetailModal(null)}></motion.div>
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-6 border-b border-border">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Order Manifest</h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-widest">ID: {orderDetailModal.id}</p>
                                </div>
                                <button onClick={() => setOrderDetailModal(null)} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-muted/10">
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="bg-card border border-border rounded-lg p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Client Target</p>
                                        <p className="font-semibold text-sm">{orderDetailModal.clientName || orderDetailModal.clientId}</p>
                                    </div>
                                    <div className="bg-card border border-border rounded-lg p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">System Status</p>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(orderDetailModal.status)}`}>
                                            {orderDetailModal.status.replace("_", " ")}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Item Breakdown</h4>
                                <div className="bg-card border border-border rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="px-4 py-2 font-semibold">SKU / Item</th>
                                                <th className="px-4 py-2 font-semibold text-center">QTY</th>
                                                <th className="px-4 py-2 font-semibold text-right">Unit Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {orderDetailModal.items && orderDetailModal.items.length > 0 ? (
                                                orderDetailModal.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-muted/30">
                                                        <td className="px-4 py-3 font-medium">{item.name || item.productId || 'Unknown Item'}</td>
                                                        <td className="px-4 py-3 text-center font-mono">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right font-mono">${(item.price || item.priceAtOrder || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No item data attached to this order.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-muted/30 border-t border-border">
                                            <tr>
                                                <td colSpan={2} className="px-4 py-3 font-bold text-right uppercase tracking-widest text-[10px]">Total Amount:</td>
                                                <td className="px-4 py-3 font-bold font-mono text-right text-sm text-primary">
                                                    ${(orderDetailModal.totalAmount || 0).toFixed(2)}
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

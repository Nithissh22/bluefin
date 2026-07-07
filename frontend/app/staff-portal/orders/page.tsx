"use client";
import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PackageSearch, ArrowRightCircle, CheckCircle, Sparkles, X, Search, Clock, ListChecks, LayoutGrid, List, Printer, AlertTriangle, PackageOpen, Boxes } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_STAGES = [
    'PENDING', 'CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'
];
const ACTIVE_BOARD_STAGES = ['CONFIRMED', 'PROCESSING', 'PACKING', 'READY_TO_SHIP'];

export default function StaffOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [viewMode, setViewMode] = useState<'LIST' | 'BOARD'>('LIST');
    
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [selectedDetailOrder, setSelectedDetailOrder] = useState<any | null>(null);
    const [showPickList, setShowPickList] = useState(false);
    
    const { user } = useAuth();
    
    useEffect(() => {
        if (!user) return;
        loadOrders();

        const eventSource = new EventSource("http://localhost:8000/api/v1/staff/orders/stream");
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'connected') return;
                setOrders((prev) => [data, ...prev.filter(o => o.id !== data.id)]);
            } catch (error) {
                console.error("Error parsing SSE data", error);
            }
        };

        return () => {
            eventSource.close();
        };
    }, [user]);

    const loadOrders = () => {
        setLoading(true);
        fetchApi("/staff/orders")
        .then(data => {
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await fetchApi(`/staff/orders/${orderId}/status`, {
                method: "POST",
                body: JSON.stringify({ status: newStatus })
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedDetailOrder?.id === orderId) {
                setSelectedDetailOrder((prev: any) => ({ ...prev, status: newStatus }));
            }
        } catch (e: any) {
            alert(e.message || "Failed to update status");
        }
    };

    const handleBulkAdvance = async () => {
        if (selectedOrders.length === 0) return;
        
        for (const orderId of selectedOrders) {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                const nextStatus = getNextStatus(order.status);
                if (nextStatus) {
                    await updateStatus(orderId, nextStatus);
                }
            }
        }
        setSelectedOrders([]);
    };

    const getNextStatus = (currentStatus: string) => {
        const idx = STATUS_STAGES.indexOf(currentStatus);
        if (idx >= 0 && idx < STATUS_STAGES.length - 1) {
            return STATUS_STAGES[idx + 1];
        }
        return null;
    };

    const getSLAColor = (createdAtString: string) => {
        const createdAt = new Date(createdAtString).getTime();
        const now = Date.now();
        const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) return 'border-l-red-500';
        if (hoursDiff > 12) return 'border-l-amber-500';
        return 'border-l-green-500';
    };

    const toggleOrderSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedOrders(prev => 
            prev.includes(id) ? prev.filter(oId => oId !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = () => {
        if (selectedOrders.length === processedOrders.length && processedOrders.length > 0) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(processedOrders.map(o => o.id));
        }
    };

    const processedOrders = useMemo(() => {
        return orders
            .filter(order => activeTab === 'ALL' || order.status === activeTab)
            .filter(order => {
                const query = searchQuery.toLowerCase();
                const idMatch = order.id.toLowerCase().includes(query);
                const nameMatch = (order.clientName || order.clientId || "").toLowerCase().includes(query);
                return idMatch || nameMatch;
            })
            .sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
    }, [orders, activeTab, searchQuery]);

    // Dashboard Metrics
    const metrics = useMemo(() => {
        const now = Date.now();
        let breaches = 0;
        let toPack = 0;
        let pending = 0;

        orders.forEach(o => {
            const hoursDiff = (now - new Date(o.created_at || o.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursDiff > 24 && o.status !== 'DELIVERED') breaches++;
            if (o.status === 'PROCESSING' || o.status === 'PACKING') toPack++;
            if (o.status === 'PENDING' || o.status === 'CONFIRMED') pending++;
        });

        return { breaches, toPack, pending };
    }, [orders]);

    // Consolidated Pick List Generation
    const pickList = useMemo(() => {
        if (!showPickList) return [];
        const aggregated: Record<string, any> = {};
        
        orders.filter(o => selectedOrders.includes(o.id)).forEach(order => {
            (order.items || []).forEach((item: any) => {
                if (!aggregated[item.productId]) {
                    // Mock SKU and Bin Location for realism
                    const sku = `SKU-${item.productId.substring(0,6).toUpperCase()}`;
                    const bin = `Bin ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20) + 1}`;
                    
                    aggregated[item.productId] = {
                        id: item.productId,
                        name: item.name,
                        qty: 0,
                        sku,
                        bin
                    };
                }
                aggregated[item.productId].qty += (item.quantity || 1);
            });
        });
        
        return Object.values(aggregated).sort((a, b) => a.bin.localeCompare(b.bin));
    }, [selectedOrders, orders, showPickList]);

    const renderProgressBar = (currentStatus: string) => {
        const currentIndex = STATUS_STAGES.indexOf(currentStatus);
        const percentage = Math.round((currentIndex / (STATUS_STAGES.length - 1)) * 100);
        
        return (
            <div className="mt-6 mb-4 bg-background/40 p-5 rounded-2xl border border-border/50 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-primary tracking-widest uppercase">{currentStatus.replace(/_/g, " ")}</span>
                    <span className="text-xs font-black text-muted-foreground uppercase">{percentage}%</span>
                </div>
                
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex relative mb-3">
                    <div 
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between px-1 relative">
                    {STATUS_STAGES.map((stage, idx) => (
                        <div 
                            key={stage} 
                            className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 relative z-10 ${idx <= currentIndex ? 'bg-primary' : 'bg-muted'}`} 
                            title={stage.replace(/_/g, " ")}
                        ></div>
                    ))}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted/50 -z-0 -translate-y-1/2"></div>
                </div>
            </div>
        );
    };

    if (!user) {
        return <div className="py-24 text-center text-muted-foreground">Please sign in as Staff.</div>;
    }

    return (
        <div className="min-h-screen bg-background pb-32 animate-in fade-in duration-500">
            
            {/* Sticky Command Center & Toolbar */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm pt-8 pb-4 px-6 md:px-12">
                <div className="max-w-[90rem] mx-auto">
                    
                    {/* Header & Metrics Dashboard */}
                    <div className="flex flex-wrap justify-between items-start md:items-end gap-6 mb-6 w-full">
                        <div className="flex-1 min-w-[280px]">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary shadow-sm text-[10px] font-bold tracking-[0.1em] mb-4 uppercase">
                                <Sparkles className="w-3.5 h-3.5" /> Staff Command Center
                            </div>
                            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight flex items-center gap-3">
                                <PackageSearch className="w-8 h-8 text-primary shrink-0" /> Fulfillment
                            </h1>
                        </div>
                        
                        {/* Metrics Widgets */}
                        <div className="flex flex-wrap gap-3 w-full md:w-auto max-w-full">
                            <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex-1 min-w-[120px] max-w-[180px] flex items-center gap-3 shadow-sm">
                                <div className="p-2 md:p-3 bg-red-100 text-red-600 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4 md:w-5 md:h-5" /></div>
                                <div className="min-w-0">
                                    <div className="text-xl md:text-2xl font-bold text-foreground truncate">{metrics.breaches}</div>
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">SLA Alerts</div>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex-1 min-w-[120px] max-w-[180px] flex items-center gap-3 shadow-sm">
                                <div className="p-2 md:p-3 bg-amber-100 text-amber-600 rounded-lg shrink-0"><PackageOpen className="w-4 h-4 md:w-5 md:h-5" /></div>
                                <div className="min-w-0">
                                    <div className="text-xl md:text-2xl font-bold text-foreground truncate">{metrics.toPack}</div>
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">To Pack</div>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-3 md:p-4 flex-1 min-w-[120px] max-w-[180px] flex items-center gap-3 shadow-sm">
                                <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0"><Boxes className="w-4 h-4 md:w-5 md:h-5" /></div>
                                <div className="min-w-0">
                                    <div className="text-xl md:text-2xl font-bold text-foreground truncate">{metrics.pending}</div>
                                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">Inbox</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar: Search, Tabs, View Toggle */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                            <button 
                                onClick={() => setActiveTab('ALL')}
                                className={`px-5 py-2.5 rounded-lg text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === 'ALL' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-border/50'}`}
                            >
                                All Orders
                            </button>
                            {STATUS_STAGES.map(stage => (
                                <button 
                                    key={stage}
                                    onClick={() => setActiveTab(stage)}
                                    className={`px-5 py-2.5 rounded-lg text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-all ${activeTab === stage ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'}`}
                                >
                                    {stage.replace(/_/g, " ")}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input 
                                    type="text"
                                    placeholder="Search ID or Client..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border focus:border-primary rounded-lg text-sm outline-none transition-all placeholder:text-muted-foreground/50 shadow-sm"
                                />
                            </div>
                            
                            <div className="flex bg-muted p-1 rounded-lg border border-border/50">
                                <button 
                                    onClick={() => setViewMode('LIST')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('BOARD')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'BOARD' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    title="Kanban Board View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[90rem] mx-auto px-6 md:px-12 mt-8 relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 text-muted-foreground">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <span className="font-medium animate-pulse tracking-wide">Syncing operations...</span>
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {viewMode === 'LIST' && (
                            <div className="flex flex-col gap-0 border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                                {/* Table Header */}
                                <div className="hidden md:flex items-center px-6 py-4 bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                                    <div className="w-10 flex-shrink-0 flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-border bg-background cursor-pointer accent-primary"
                                            checked={selectedOrders.length === processedOrders.length && processedOrders.length > 0}
                                            onChange={toggleAllSelection}
                                        />
                                    </div>
                                    <div className="w-32 flex-shrink-0">Order ID</div>
                                    <div className="flex-1 min-w-0">Client Name</div>
                                    <div className="w-24 flex-shrink-0 text-center">Items</div>
                                    <div className="w-40 flex-shrink-0">Time Received</div>
                                    <div className="w-36 flex-shrink-0 text-center">Status</div>
                                    <div className="w-32 flex-shrink-0 text-right">Action</div>
                                </div>

                                {/* List Rows */}
                                <AnimatePresence mode="popLayout">
                                    {processedOrders.length > 0 ? (
                                        processedOrders.map((order: any, idx: number) => {
                                            const nextStatus = getNextStatus(order.status);
                                            const slaClass = getSLAColor(order.created_at || order.createdAt);
                                            const isSelected = selectedOrders.includes(order.id);

                                            return (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    key={order.id} 
                                                    onClick={() => setSelectedDetailOrder(order)}
                                                    className={`group flex flex-col md:flex-row md:items-center px-4 py-4 md:px-6 bg-background hover:bg-muted/30 border-b border-border cursor-pointer transition-all ${slaClass} border-l-4 ${isSelected ? 'bg-muted/50' : ''} last:border-b-0`}
                                                >
                                                    <div className="flex items-center justify-between md:w-auto mb-3 md:mb-0">
                                                        <div className="flex items-center gap-4 md:w-42">
                                                            <div className="w-6 flex items-center justify-center" onClick={(e) => toggleOrderSelection(order.id, e)}>
                                                                <input type="checkbox" className="w-4 h-4 rounded border-border cursor-pointer accent-primary" checked={isSelected} readOnly />
                                                            </div>
                                                            <div className="font-mono text-sm font-medium text-foreground truncate w-24">
                                                                #{order.id.split("-")[0].toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="md:hidden">
                                                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                                                {order.status.replace(/_/g, " ")}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 truncate font-medium text-foreground md:pr-4 mb-1 md:mb-0 text-sm">
                                                        {order.clientName || order.clientId?.split("-")[0] || "Unknown Client"}
                                                    </div>

                                                    <div className="w-full md:w-24 text-sm text-muted-foreground flex items-center gap-2 md:justify-center mb-1 md:mb-0">
                                                        <span className="md:hidden text-[10px] uppercase font-bold tracking-widest">Items:</span>
                                                        {order.items?.length || 0} unit(s)
                                                    </div>

                                                    <div className="w-full md:w-40 text-sm text-muted-foreground flex items-center gap-2 mb-3 md:mb-0 whitespace-nowrap">
                                                        <span className="md:hidden text-[10px] uppercase font-bold tracking-widest">Date:</span>
                                                        <Clock className="w-3.5 h-3.5 hidden md:inline-block opacity-50" />
                                                        {new Date(order.created_at || order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                    </div>

                                                    <div className="hidden md:flex w-36 items-center justify-center">
                                                        <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                                            {order.status.replace(/_/g, " ")}
                                                        </span>
                                                    </div>

                                                    <div className="w-full md:w-32 flex justify-end">
                                                        {nextStatus ? (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }}
                                                                className="w-full md:w-auto px-4 py-2 bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-1.5"
                                                            >
                                                                Advance <ArrowRightCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        ) : (
                                                            <div className="w-full md:w-auto px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-1.5">
                                                                <CheckCircle className="w-3.5 h-3.5" /> Done
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    ) : (
                                        <div className="py-24 text-center">
                                            <ListChecks className="w-12 h-12 mx-auto mb-4 opacity-20 text-foreground" />
                                            <h3 className="text-lg font-medium text-foreground mb-1">Queue is empty</h3>
                                            <p className="text-muted-foreground text-sm">No orders match your current view.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* BOARD VIEW (Kanban) */}
                        {viewMode === 'BOARD' && (
                            <div className="flex gap-6 overflow-x-auto pb-8 snap-x min-h-[60vh]">
                                {ACTIVE_BOARD_STAGES.map(stage => {
                                    const stageOrders = orders.filter(o => o.status === stage);
                                    
                                    return (
                                        <div key={stage} className="flex-shrink-0 w-80 flex flex-col bg-muted/30 rounded-xl border border-border/50 snap-start h-fit max-h-[75vh]">
                                            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-card rounded-t-xl">
                                                <h3 className="font-bold text-sm tracking-wide text-foreground">{stage.replace(/_/g, " ")}</h3>
                                                <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{stageOrders.length}</span>
                                            </div>
                                            
                                            <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                                {stageOrders.map((order: any) => {
                                                    const nextStatus = getNextStatus(order.status);
                                                    return (
                                                        <div 
                                                            key={order.id}
                                                            onClick={() => setSelectedDetailOrder(order)}
                                                            className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="font-mono text-xs font-bold text-muted-foreground">#{order.id.split("-")[0].toUpperCase()}</span>
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {new Date(order.created_at || order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                </span>
                                                            </div>
                                                            <div className="font-semibold text-sm mb-3 truncate">{order.clientName || "Unknown Client"}</div>
                                                            <div className="flex justify-between items-center mt-4">
                                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{order.items?.length || 0} items</span>
                                                                {nextStatus && (
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }}
                                                                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/10 px-2 py-1 rounded"
                                                                    >
                                                                        Advance <ArrowRightCircle className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {stageOrders.length === 0 && (
                                                    <div className="text-center py-8 text-muted-foreground text-xs italic">
                                                        No orders in this stage.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Action Bar - Industry Standard */}
            <AnimatePresence>
                {selectedOrders.length > 0 && viewMode === 'LIST' && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background shadow-2xl rounded-xl px-6 py-3 flex items-center gap-6 border border-border"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-background/20 flex items-center justify-center font-mono text-xs">
                                {selectedOrders.length}
                            </div>
                            <span className="text-sm font-medium">Selected</span>
                        </div>
                        <div className="w-px h-6 bg-background/20"></div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowPickList(true)}
                                className="bg-background/10 hover:bg-background/20 text-background px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Pick List
                            </button>
                            <button 
                                onClick={handleBulkAdvance}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                            >
                                Advance All <ArrowRightCircle className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <button onClick={() => setSelectedOrders([])} className="p-2 text-background/60 hover:text-background ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print Pick List Modal */}
            <AnimatePresence>
                {showPickList && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card w-full max-w-3xl border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2"><Printer className="w-5 h-5" /> Consolidated Pick List</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Aggregated items for {selectedOrders.length} selected orders</p>
                                </div>
                                <button onClick={() => setShowPickList(false)} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-card text-black dark:text-foreground">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-black/20 dark:border-border">
                                            <th className="pb-3 font-bold">Bin Location</th>
                                            <th className="pb-3 font-bold">SKU</th>
                                            <th className="pb-3 font-bold">Product Name</th>
                                            <th className="pb-3 text-right font-bold">Total Qty Required</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/10 dark:divide-border/50">
                                        {pickList.map((item: any, i: number) => (
                                            <tr key={i}>
                                                <td className="py-4 font-mono font-bold text-xs">{item.bin}</td>
                                                <td className="py-4 font-mono text-xs text-black/60 dark:text-muted-foreground">{item.sku}</td>
                                                <td className="py-4 font-medium">{item.name}</td>
                                                <td className="py-4 text-right font-black text-lg">{item.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                                <button onClick={() => setShowPickList(false)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Close</button>
                                <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:brightness-110 flex items-center gap-2">
                                    <Printer className="w-4 h-4" /> Print Document
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Slide-over Detail Modal with Inventory Mock */}
            <AnimatePresence>
                {selectedDetailOrder && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm"
                        onClick={() => setSelectedDetailOrder(null)}
                    >
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xl h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
                                <div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Order Summary</span>
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        #{selectedDetailOrder.id.split("-")[0].toUpperCase()}
                                    </h2>
                                </div>
                                <button onClick={() => setSelectedDetailOrder(null)} className="p-2 bg-background rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Client Profile</span>
                                        <div className="font-medium text-sm">{selectedDetailOrder.clientName || "Unknown Client"}</div>
                                    </div>
                                    <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Time Logged</span>
                                        <div className="font-medium text-sm">
                                            {new Date(selectedDetailOrder.created_at || selectedDetailOrder.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2 px-1">Fulfillment Pipeline</h4>
                                    {renderProgressBar(selectedDetailOrder.status)}
                                </div>

                                <div>
                                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 px-1 flex justify-between items-center">
                                        <span>Order Requirements</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedDetailOrder.items && selectedDetailOrder.items.length > 0 ? (
                                            selectedDetailOrder.items.map((item: any, idx: number) => {
                                                // Mock stock logic based on ID for persistence in the session
                                                const hash = item.productId.charCodeAt(0) + item.productId.charCodeAt(item.productId.length - 1);
                                                const isInStock = hash % 5 !== 0; // 80% chance in stock
                                                
                                                return (
                                                    <div key={idx} className="flex justify-between items-start p-4 bg-card rounded-lg border border-border">
                                                        <div>
                                                            <div className="font-medium text-sm">{item.name}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                                                <span>Qty Required: <strong className="text-foreground">{item.quantity}</strong></span>
                                                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                                                <span className="font-mono text-[10px]">SKU-{item.productId.substring(0,6).toUpperCase()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {isInStock ? (
                                                                <span className="bg-green-100 text-green-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">In Stock - Bin {(hash % 5)+1}</span>
                                                            ) : (
                                                                <span className="bg-red-100 text-red-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">Low Stock</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-sm text-muted-foreground italic px-2">No items listed.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-border bg-background">
                                {getNextStatus(selectedDetailOrder.status) ? (
                                    <button 
                                        onClick={() => updateStatus(selectedDetailOrder.id, getNextStatus(selectedDetailOrder.status) as string)}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 font-bold text-sm transition-all uppercase tracking-widest"
                                    >
                                        Advance to {(getNextStatus(selectedDetailOrder.status) as string).replace(/_/g, " ")} <ArrowRightCircle className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-green-50 border border-green-200 text-green-700 font-bold text-sm cursor-default uppercase tracking-widest">
                                        <CheckCircle className="w-5 h-5" /> Pipeline Completed
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

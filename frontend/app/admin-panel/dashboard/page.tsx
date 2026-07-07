"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, Users, Box, ShoppingCart, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState("");
    const [insightsLoading, setInsightsLoading] = useState(false);
    
    useEffect(() => {
        Promise.all([
            fetchApi("/admin/orders").catch(() => []),
            fetchApi("/admin/users").catch(() => []),
            fetchApi("/admin/products").catch(() => [])
        ]).then(([ordersData, usersData, productsData]) => {
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setProducts(Array.isArray(productsData) ? productsData : []);
            setLoading(false);
        });
    }, []);

    const handleGenerateInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await fetchApi("/ai/inventory-insights");
            setInsights(res.insights);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch insights");
        } finally {
            setInsightsLoading(false);
        }
    };

    // Calculate metrics
    const revenue = orders.reduce((acc, o) => {
        const orderTotal = o.items ? o.items.reduce((sum: number, item: any) => sum + (item.price_at_order * item.quantity), 0) : 0;
        return acc + orderTotal;
    }, 0);

    // Prepare chart data (Orders by Status)
    const statusCounts = orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});
    
    const chartData = Object.keys(statusCounts).map(status => ({
        name: status.replace("_", " "),
        value: statusCounts[status]
    }));

    if (loading) {
        return <LoadingScreen fullScreen={false} />;
    }

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-500 max-w-[100rem] mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Executive Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">Real-time telemetry across the Bluefin Bio Science infrastructure.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Systems Operational</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Metric 1 */}
                <div className="bg-card rounded-xl p-6 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                            <ArrowUpRight className="w-3 h-3" /> 14.2%
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Gross Revenue</p>
                    <p className="text-3xl font-black text-foreground tracking-tight">${revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-card rounded-xl p-6 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                            <ArrowUpRight className="w-3 h-3" /> 8.1%
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order Volume</p>
                    <p className="text-3xl font-black text-foreground tracking-tight">{orders.length}</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-card rounded-xl p-6 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">
                            <ArrowUpRight className="w-3 h-3" /> 2.4%
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active Accounts</p>
                    <p className="text-3xl font-black text-foreground tracking-tight">{users.length}</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-card rounded-xl p-6 border border-border/80 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                            <Box className="w-5 h-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold">
                            <ArrowDownRight className="w-3 h-3" /> 1.1%
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Catalog Skus</p>
                    <p className="text-3xl font-black text-foreground tracking-tight">{products.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Pipeline Chart */}
                <div className="xl:col-span-2 bg-card rounded-xl p-6 border border-border/80 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" /> Fulfillment Throughput
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Live distribution of orders across pipeline stages</p>
                        </div>
                    </div>
                    
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(0,0,0,0.03)'}} 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={'#3B82F6'} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Copilot / AI Insights Section */}
                    <div className="bg-[#0F172A] rounded-xl shadow-xl relative overflow-hidden flex flex-col h-full border border-slate-800">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full pointer-events-none"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none"></div>
                        
                        <div className="p-6 relative z-10 border-b border-slate-800/50">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-3">
                                <Sparkles className="w-3 h-3" /> System Copilot
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">NVIDIA AI Analysis</h2>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Our LLM engine continuously monitors order velocity and SKU depletion to recommend proactive inventory actions.
                            </p>
                        </div>
                        
                        <div className="p-6 relative z-10 flex-1 flex flex-col">
                            {insights ? (
                                <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4 text-sm text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar font-mono">
                                    {insights}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-700 rounded-lg bg-slate-900/20">
                                    <Zap className="w-8 h-8 text-slate-600 mb-3" />
                                    <p className="text-sm text-slate-400 font-medium">Ready to analyze cluster data</p>
                                </div>
                            )}
                            
                            <button 
                                onClick={handleGenerateInsights}
                                disabled={insightsLoading}
                                className="w-full mt-4 bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 rounded-lg text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {insightsLoading ? (
                                    <><div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div> Processing Data...</>
                                ) : (
                                    "Run Diagnostic Scan"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

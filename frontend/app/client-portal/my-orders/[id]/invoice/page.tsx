"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";

export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchApi("/client/orders")
            .then(data => {
                const found = data.find((o: any) => o.id === params.id);
                setOrder(found || null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="font-medium animate-pulse text-muted-foreground">Generating Invoice...</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="py-24 text-center">
                <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
                <button onClick={() => router.back()} className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl">Go Back</button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center print:hidden">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-colors">
                    <Printer className="w-4 h-4" /> Print Invoice
                </button>
            </div>

            <div className="bg-white text-black p-10 rounded-2xl border border-zinc-200 shadow-sm print:shadow-none print:border-none print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-zinc-200 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-1">OMS</h1>
                        <p className="text-sm text-zinc-500">Bio Science Equipment & Reagents</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-zinc-800 mb-1">INVOICE</h2>
                        <p className="text-sm text-zinc-500 font-mono">#{order.id.toUpperCase()}</p>
                    </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Billed To</h3>
                        <p className="font-semibold text-zinc-900">{order.shippingAddress?.split(',')[0] || "Client Customer"}</p>
                        <p className="text-sm text-zinc-600 mt-1">{order.shippingAddress}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Payment Details</h3>
                        <p className="text-sm text-zinc-600">Date: <span className="font-semibold text-zinc-900">{new Date(order.created_at).toLocaleDateString()}</span></p>
                        <p className="text-sm text-zinc-600 mt-1">Method: <span className="font-semibold text-zinc-900">{order.paymentDetails?.method || "CREDIT_CARD"} ending in {order.paymentDetails?.last4 || "****"}</span></p>
                    </div>
                </div>

                {/* Items */}
                <table className="w-full mb-10">
                    <thead>
                        <tr className="border-b border-zinc-200 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            <th className="pb-3">Description</th>
                            <th className="pb-3 text-center">Qty</th>
                            <th className="pb-3 text-right">Unit Price</th>
                            <th className="pb-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {order.items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-zinc-100 last:border-0">
                                <td className="py-4 text-zinc-900">
                                    Product ID: <span className="font-mono text-xs">{item.productId.split('-')[0]}</span>
                                </td>
                                <td className="py-4 text-center text-zinc-900">{item.quantity}</td>
                                <td className="py-4 text-right text-zinc-900">${item.priceAtOrder.toFixed(2)}</td>
                                <td className="py-4 text-right font-medium text-zinc-900">${(item.quantity * item.priceAtOrder).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end border-t border-zinc-200 pt-6">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm text-zinc-600">
                            <span>Subtotal</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-600">
                            <span>Tax (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-zinc-900 border-t border-zinc-200 pt-3 mt-3">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-400">
                    <p>Thank you for your business. For any inquiries regarding this invoice, please contact support@oms.com.</p>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CreditCard, Truck, ShieldCheck, CheckCircle2, Lock, ArrowRight, Activity, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [step, setStep] = useState(1); // 1 = Shipping, 2 = Payment

    const [form, setForm] = useState({
        fullName: "",
        address: "",
        city: "",
        zipCode: "",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
        } else {
            handleCheckout(e);
        }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const orderPayload = {
                items: items.map(i => ({
                    productId: i.product.id,
                    quantity: i.quantity,
                    priceAtOrder: i.product.price
                })),
                totalAmount: total,
                shippingAddress: `${form.address}, ${form.city}, ${form.zipCode}`,
                paymentDetails: {
                    method: "CREDIT_CARD",
                    last4: form.cardNumber.slice(-4) || "0000"
                }
            };

            await fetchApi("/client/orders", {
                method: "POST",
                body: JSON.stringify(orderPayload)
            });

            setSuccess(true);
            setTimeout(() => {
                clearCart();
                router.push("/client-portal/my-orders");
            }, 1500);
        } catch (error) {
            console.error(error);
            alert("Failed to place order. Please try again.");
            setLoading(false);
        }
    };

    if (items.length === 0 && !success) {
        return (
            <div className="py-24 text-center">
                <Activity className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Items in Cart</h2>
                <button onClick={() => router.push("/client-portal/products")} className="mt-4 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">Return to Catalog</button>
            </div>
        );
    }

    return (
        <div className="pb-16 pt-6 animate-in fade-in duration-500 max-w-6xl mx-auto relative z-10">
            {/* Header */}
            <div className="mb-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full mb-4">
                    <Lock className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Secure Checkout</h1>
                <p className="text-slate-500 font-medium">Complete your procurement request. All data is securely encrypted.</p>
            </div>

            {/* Stepper UI */}
            <div className="flex items-center justify-center mb-12">
                <div className="flex items-center gap-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
                    
                    {/* Step 1 */}
                    <div className="flex flex-col items-center gap-2 bg-[#F8FAFC] px-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-200 text-slate-400'}`}>
                            {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : 1}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>Shipping</span>
                    </div>

                    <div className={`w-16 h-0.5 ${step > 1 ? 'bg-blue-600' : 'bg-transparent'} transition-colors duration-500`}></div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center gap-2 bg-[#F8FAFC] px-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
                            2
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>Payment</span>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleNextStep} className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
                                <h2 className="flex items-center gap-3 text-xl font-bold mb-8 tracking-tight text-slate-900 border-b border-slate-100 pb-4">
                                    <Truck className="w-5 h-5 text-blue-600" /> Destination Address
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Receiving Contact</label>
                                        <input required type="text" name="fullName" value={form.fullName} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 bg-slate-50 focus:bg-white" placeholder="Dr. Sarah Jenkins" />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Facility / Delivery Address</label>
                                        <input required type="text" name="address" value={form.address} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 bg-slate-50 focus:bg-white" placeholder="Building B, Suite 400" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">City</label>
                                        <input required type="text" name="city" value={form.city} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 bg-slate-50 focus:bg-white" placeholder="Cambridge" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Postal Code</label>
                                        <input required type="text" name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-900 bg-slate-50 focus:bg-white" placeholder="02142" />
                                    </div>
                                </div>
                                <div className="mt-10 flex justify-end">
                                    <button type="submit" className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2">
                                        Continue to Payment <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
                                <h2 className="flex items-center gap-3 text-xl font-bold mb-8 tracking-tight text-slate-900 border-b border-slate-100 pb-4">
                                    <CreditCard className="w-5 h-5 text-blue-600" /> Billing Information
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                                        <div className="relative">
                                            <input required type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} maxLength={16} className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono font-medium text-slate-900 tracking-widest bg-slate-50 focus:bg-white" placeholder="0000 0000 0000 0000" />
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Expiry Date</label>
                                        <input required type="text" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono font-medium text-slate-900 bg-slate-50 focus:bg-white text-center" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Security Code (CVV)</label>
                                        <input required name="cvv" value={form.cvv} onChange={handleChange} maxLength={4} className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono font-medium text-slate-900 bg-slate-50 focus:bg-white text-center" placeholder="•••" type="password" />
                                    </div>
                                </div>
                                
                                <div className="mt-10 flex items-center justify-between">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                                        Back to Shipping
                                    </button>
                                    <button disabled={loading || success} type="submit" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 min-w-[200px] justify-center">
                                        <AnimatePresence mode="wait">
                                            {success ? (
                                                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5" /> Secured
                                                </motion.div>
                                            ) : loading ? (
                                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Authorizing...
                                                </motion.div>
                                            ) : (
                                                <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" /> Pay ${total.toFixed(2)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="md:col-span-4">
                    <div className="bg-slate-900 text-white rounded-2xl p-8 sticky top-28 shadow-xl">
                        <h2 className="font-bold text-xl mb-6 tracking-tight flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-400" /> Order Outline
                        </h2>
                        <div className="space-y-4 mb-8">
                            {items.map(item => (
                                <div key={item.product.id} className="flex justify-between text-sm items-start py-2 border-b border-slate-800 last:border-0">
                                    <span className="text-slate-400 font-medium pr-4 leading-relaxed">
                                        <span className="text-white font-bold mr-1">{item.quantity}x</span> {item.product.name}
                                    </span>
                                    <span className="font-bold text-slate-300 mt-1">${(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                                <span className="text-2xl font-black text-white tracking-tight">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

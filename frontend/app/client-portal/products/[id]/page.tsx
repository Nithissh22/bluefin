"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, ShoppingCart, Info, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export default function ProductDetails() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const { user } = useAuth();
    
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        // We will fetch all and filter since there's no single product endpoint in client router
        fetchApi("/client/products")
        .then(data => {
            if (Array.isArray(data)) {
                const found = data.find(p => p.id === id);
                setProduct(found || null);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const addToCart = async () => {
        if (!user) {
            alert("Please login to place an order.");
            return;
        }
        setAdding(true);
        try {
            // For now, simulate adding to cart by placing an order directly or using local storage.
            // Since the requirements say "Place Online Orders", let's build a real cart in localStorage, 
            // and then checkout from the cart page.
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const existing = cart.find((item: any) => item.product_id === product.id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ product_id: product.id, quantity: 1, product });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            
            // Redirect to cart
            router.push("/cart");
        } catch (e: any) {
            alert(e.message || "Failed to add to cart.");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-muted-foreground">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="font-medium animate-pulse">Loading precision data...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="py-24 text-center">
                <h2 className="text-2xl font-bold text-foreground">Product Not Found</h2>
                <Link href="/products" className="text-primary hover:underline mt-4 inline-block">Return to Catalog</Link>
            </div>
        );
    }

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-500">
            <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Catalog
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Image Gallery (Single Image for now) */}
                <div className="bg-card rounded-3xl border border-border/60 overflow-hidden shadow-2xl shadow-primary/5 sticky top-24">
                    {product.image_url ? (
                        <div className="aspect-square relative flex items-center justify-center bg-muted/30">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                            No Image Available
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <div className="inline-block bg-accent/10 text-accent font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-widest w-fit mb-4 border border-accent/20">
                        {product.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight mb-4 tracking-tight">
                        {product.name}
                    </h1>
                    <div className="text-3xl font-bold text-primary mb-6">
                        ${product.price.toFixed(2)}
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50">
                            <CheckCircle2 className="w-5 h-5 text-accent mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground text-sm">In Stock</h4>
                                <p className="text-xs text-muted-foreground">{product.stock} units available</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50">
                            <ShieldCheck className="w-5 h-5 text-accent mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-foreground text-sm">Bio-Certified</h4>
                                <p className="text-xs text-muted-foreground">Tested for lab environments</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Truck className="w-4 h-4"/> Estimated Delivery</span>
                            <span className="font-semibold text-foreground">3-5 Business Days</span>
                        </div>
                        <hr className="border-border/50" />
                        <button 
                            onClick={addToCart}
                            disabled={adding || product.stock < 1}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-primary/20"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {adding ? "Adding to Cart..." : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Box, Plus, Edit, Trash2 } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ id: '', name: '', category: '', price: 0, stock: 0, description: '', image_url: '' });
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = () => {
        setLoading(true);
        fetchApi("/admin/products")
        .then(data => {
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(console.error);
    };

    const handleGenerateDescription = async () => {
        if (!newProduct.name) return alert("Please enter a product name first");
        setAiLoading(true);
        try {
            const res = await fetchApi("/ai/generate-description", {
                method: "POST",
                body: JSON.stringify({ productName: newProduct.name, category: newProduct.category })
            });
            setNewProduct(prev => ({ ...prev, description: res.description }));
        } catch (error) {
            console.error(error);
            alert("Failed to generate description");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddProduct = async () => {
        if (newProduct.id) {
            // Editing existing product
            setProducts(prev => prev.map(p => p.id === newProduct.id ? { ...p, ...newProduct } : p));
            setIsEditModalOpen(false);
        } else {
            // Adding new product
            setProducts(prev => [{
                ...newProduct,
                id: Math.random().toString()
            }, ...prev]);
            setIsAddModalOpen(false);
        }
        setNewProduct({ id: '', name: '', category: '', price: 0, stock: 0, description: '', image_url: '' });
    };

    const handleEditClick = (product: any) => {
        setNewProduct(product);
        setIsEditModalOpen(true);
    };

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-500">
            <div className="mb-10 flex justify-between items-end border-b border-border/50 pb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-foreground mb-3 tracking-tight flex items-center gap-3">
                        <Box className="w-8 h-8 text-accent" /> Product Catalog
                    </h1>
                    <p className="text-muted-foreground text-lg">Manage bio-science inventory and pricing.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-5 h-5" /> Add Product
                </button>
            </div>

            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-card w-full max-w-xl p-8 rounded-2xl border border-border shadow-2xl flex flex-col gap-6">
                        <div className="flex justify-between items-center border-b border-border pb-4">
                            <h2 className="text-2xl font-bold text-foreground">{isEditModalOpen ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setNewProduct({ id: '', name: '', category: '', price: 0, stock: 0, description: '', image_url: '' }); }} className="text-muted-foreground hover:text-foreground"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary" />
                            <div className="flex gap-4">
                                <input type="text" placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary" />
                                <input type="number" placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary" />
                                <input type="number" placeholder="Stock" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary" />
                            </div>
                            <input type="text" placeholder="Image URL (optional)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary" />
                            
                            <div className="relative">
                                <textarea placeholder="Product Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-muted px-4 py-3 rounded-xl text-sm outline-none border border-transparent focus:border-primary min-h-[120px]" />
                                <button 
                                    onClick={handleGenerateDescription}
                                    disabled={aiLoading || !newProduct.name}
                                    className="absolute bottom-4 right-4 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                >
                                    {aiLoading ? "Generating..." : "✨ AI Generate"}
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setNewProduct({ id: '', name: '', category: '', price: 0, stock: 0, description: '', image_url: '' }); }} className="px-6 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold transition-colors">Cancel</button>
                            <button onClick={handleAddProduct} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm">{isEditModalOpen ? "Save Changes" : "Save Product"}</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <LoadingScreen fullScreen={false} />
            ) : (
                <div className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/50 text-foreground font-semibold border-b border-border/60">
                                <tr>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-muted border border-border/50 overflow-hidden">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex justify-center items-center text-[10px] text-muted-foreground">No img</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-foreground">{p.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{p.category}</td>
                                        <td className="px-6 py-4 font-medium text-foreground">${p.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                p.stock > 10 ? 'bg-green-100 text-green-800' :
                                                p.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(p)} className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

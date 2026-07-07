"use client";
import { useEffect, useState, FormEvent } from "react";
import { fetchApi } from "@/lib/api";
import { Plus } from "lucide-react";

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Electronics");
    const [imageUrl, setImageUrl] = useState("");

    const loadProducts = () => {
        setLoading(true);
        fetch("http://localhost:8000/api/v1/admin/products", {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
            }
        })
        .then(r => r.json())
        .then(data => {
            setProducts(data);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleCreateProduct = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await fetchApi("/admin/products", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock, 10),
                    category,
                    image_url: imageUrl || undefined,
                    is_active: true
                })
            });
            setShowForm(false);
            // Reset form
            setName("");
            setDescription("");
            setPrice("");
            setStock("");
            setCategory("Electronics");
            setImageUrl("");
            // Reload
            loadProducts();
        } catch (err: any) {
            alert(err.message || "Failed to create product");
        }
    };

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-end mb-8 border-b border-zinc-200 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
                        Product Management
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Manage the catalog inventory and add new products.
                    </p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {showForm ? "Cancel" : "Add Product"}
                </button>
            </div>

            {showForm && (
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8 animate-in slide-in-from-top-4 duration-200">
                    <h2 className="text-lg font-medium text-zinc-900 mb-4">Create New Product</h2>
                    <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-700">Name</label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="Product Name" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-700">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500">
                                <option>Electronics</option>
                                <option>Furniture</option>
                                <option>Accessories</option>
                                <option>Software</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-700">Price ($)</label>
                            <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-700">Stock Quantity</label>
                            <input required type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="0" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-zinc-700">Image URL (Optional)</label>
                            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="https://..." />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-zinc-700">Description</label>
                            <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-md text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500" placeholder="Product details..."></textarea>
                        </div>
                        <div className="md:col-span-2 pt-2 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-colors">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex items-center space-x-2 text-sm text-zinc-500">
                    <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
                    <span>Loading inventory...</span>
                </div>
            ) : (
                <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-500">
                        <thead className="bg-zinc-50 text-xs uppercase text-zinc-700 font-medium border-b border-zinc-200">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4 text-right">Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((p: any) => (
                                    <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-3">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-sm object-cover bg-zinc-100" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-sm bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[8px] text-zinc-400">IMG</div>
                                            )}
                                            {p.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-zinc-100 text-[10px] font-semibold text-zinc-800">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-900">
                                            ${p.price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-zinc-900'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                                        No products in inventory.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

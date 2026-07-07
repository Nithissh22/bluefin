"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

export default function StaffOrders() {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
        fetchApi("/staff/orders").then(setOrders).catch(console.error);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Assigned Orders</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o: any) => (
                            <tr key={o.id} className="border-b">
                                <td className="p-4">{o.id}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{o.status}</span>
                                </td>
                                <td className="p-4">
                                    <button className="text-blue-600 hover:underline">Update Status</button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">No assigned orders</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Users, Shield, Plus, MoreHorizontal, AlertCircle, Ban, KeyRound, Mail, Settings, X, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // Modal States
    const [logsModal, setLogsModal] = useState<{ open: boolean, userId: string | null, logs: any[] }>({ open: false, userId: null, logs: [] });
    const [roleModal, setRoleModal] = useState<{ open: boolean, user: any | null, newRole: string }>({ open: false, user: null, newRole: '' });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuOpenId) setMenuOpenId(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuOpenId]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        setLoading(true);
        fetchApi("/admin/users")
        .then(data => {
            setUsers(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(console.error);
    };

    const toggleMenu = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === id ? null : id);
    };

    // Actions
    const handleSuspendToggle = async (user: any) => {
        const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        if (!confirm(`Are you sure you want to ${newStatus === 'SUSPENDED' ? 'suspend' : 'reactivate'} ${user.name}?`)) return;
        
        try {
            await fetchApi(`/admin/users/${user.id}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: newStatus })
            });
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
            setMenuOpenId(null);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    const handleResetPassword = async (user: any) => {
        if (!confirm(`Force password reset for ${user.name} to default?`)) return;
        
        try {
            await fetchApi(`/admin/users/${user.id}/reset-password`, { method: "PUT" });
            alert("Password successfully reset to default.");
            setMenuOpenId(null);
        } catch (error) {
            alert("Failed to reset password");
        }
    };

    const openRoleModal = (user: any) => {
        setRoleModal({ open: true, user, newRole: user.role });
        setMenuOpenId(null);
    };

    const submitRoleChange = async () => {
        if (!roleModal.user) return;
        try {
            await fetchApi(`/admin/users/${roleModal.user.id}/role`, {
                method: "PUT",
                body: JSON.stringify({ role: roleModal.newRole })
            });
            setUsers(prev => prev.map(u => u.id === roleModal.user.id ? { ...u, role: roleModal.newRole } : u));
            setRoleModal({ open: false, user: null, newRole: '' });
        } catch (error) {
            alert("Failed to update role");
        }
    };

    const openLogsModal = async (userId: string) => {
        setMenuOpenId(null);
        setLogsModal({ open: true, userId, logs: [] });
        try {
            const data = await fetchApi(`/admin/users/${userId}/logs`);
            setLogsModal({ open: true, userId, logs: Array.isArray(data) ? data : [] });
        } catch (error) {
            alert("Failed to fetch logs");
        }
    };

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-500 max-w-[100rem] mx-auto">
            
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                        User Governance
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1 font-medium">Manage identities, roles, and security policies.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all text-xs uppercase tracking-widest shadow-md">
                        <Plus className="w-3.5 h-3.5" /> Provision User
                    </button>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto min-h-[50vh]">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider uppercase text-[10px]">Identity</th>
                                <th className="px-6 py-4 font-bold tracking-wider uppercase text-[10px]">Security Role</th>
                                <th className="px-6 py-4 font-bold tracking-wider uppercase text-[10px]">System Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider uppercase text-[10px]">Registration (UTC)</th>
                                <th className="px-6 py-4 text-right font-bold tracking-wider uppercase text-[10px]">Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                                        Querying identity records...
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((u, i) => {
                                    
                                    let statusColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                                    if (u.status === "SUSPENDED") {
                                        statusColor = "bg-red-100 text-red-700 border-red-200";
                                    } else if (u.status === "PENDING_MFA") {
                                        statusColor = "bg-amber-100 text-amber-700 border-amber-200";
                                    }

                                    return (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                        {u.name.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{u.name}</div>
                                                        <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3 h-3" /> {u.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit border ${
                                                    u.role.toUpperCase() === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    u.role.toUpperCase() === 'STAFF' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-slate-50 text-slate-700 border-slate-200'
                                                }`}>
                                                    {u.role.toUpperCase() === 'ADMIN' && <Shield className="w-3 h-3" />}
                                                    {u.role.toUpperCase() === 'STAFF' && <Settings className="w-3 h-3" />}
                                                    {u.role.toUpperCase() === 'CLIENT' && <Users className="w-3 h-3" />}
                                                    {u.role}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${statusColor}`}>
                                                    {(u.status || "ACTIVE").replace("_", " ")}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-muted-foreground tabular-nums font-mono text-xs">
                                                {new Date(u.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                                            </td>

                                            <td className="px-6 py-4 text-right relative">
                                                <button 
                                                    onClick={(e) => toggleMenu(u.id, e)}
                                                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>

                                                {/* Action Dropdown */}
                                                {menuOpenId === u.id && (
                                                    <div 
                                                        className="absolute right-8 top-10 w-48 bg-card border border-border rounded-lg shadow-xl py-1 z-50 text-left"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className="px-3 py-2 border-b border-border mb-1">
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Governance Actions</div>
                                                        </div>
                                                        <button onClick={() => openRoleModal(u)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground">
                                                            <Settings className="w-3.5 h-3.5" /> Modify Permissions
                                                        </button>
                                                        <button onClick={() => openLogsModal(u.id)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground">
                                                            <AlertCircle className="w-3.5 h-3.5" /> View Audit Logs
                                                        </button>
                                                        <button onClick={() => handleResetPassword(u)} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-muted flex items-center gap-2 text-foreground border-b border-border">
                                                            <KeyRound className="w-3.5 h-3.5" /> Reset Credentials
                                                        </button>
                                                        <button onClick={() => handleSuspendToggle(u)} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-red-50 text-red-600 flex items-center gap-2 mt-1">
                                                            <Ban className="w-3.5 h-3.5" /> {u.status === 'SUSPENDED' ? 'Reactivate Account' : 'Suspend Account'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No identities found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Role Change Modal */}
            <AnimatePresence>
                {roleModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setRoleModal({ open: false, user: null, newRole: '' })}></motion.div>
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-sm relative z-10 p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Modify Role</h3>
                                <button onClick={() => setRoleModal({ open: false, user: null, newRole: '' })} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4">Select new security role for <span className="font-bold text-foreground">{roleModal.user?.name}</span>.</p>
                            
                            <select 
                                className="w-full p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary mb-6"
                                value={roleModal.newRole}
                                onChange={(e) => setRoleModal(prev => ({ ...prev, newRole: e.target.value }))}
                            >
                                <option value="CLIENT">Client</option>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Administrator</option>
                            </select>

                            <div className="flex gap-3 justify-end">
                                <button onClick={() => setRoleModal({ open: false, user: null, newRole: '' })} className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted">Cancel</button>
                                <button onClick={submitRoleChange} className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90">Confirm Role</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Audit Logs Modal */}
            <AnimatePresence>
                {logsModal.open && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setLogsModal({ open: false, userId: null, logs: [] })}></motion.div>
                        
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-lg relative z-10 flex flex-col max-h-[80vh]">
                            <div className="flex justify-between items-center p-6 border-b border-border">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Audit Logs</h3>
                                <button onClick={() => setLogsModal({ open: false, userId: null, logs: [] })} className="text-muted-foreground hover:text-foreground">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                {logsModal.logs.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground text-sm">
                                        No security events recorded for this user.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {logsModal.logs.map(log => (
                                            <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                                                <div className="mt-1"><AlertCircle className="w-4 h-4 text-primary" /></div>
                                                <div>
                                                    <div className="font-bold text-sm text-foreground">{log.action.replace(/_/g, ' ')}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{log.details}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

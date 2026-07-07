"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { UserCircle, Mail, Phone, Lock, Save, ShieldCheck } from "lucide-react";

export default function Profile() {
    const { user, login } = useAuth(); // Assuming login context can update user state if needed, or we just rely on fetch
    const [profile, setProfile] = useState({ name: "", email: "", phone: "", password: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        fetchApi("/client/profile")
        .then(data => {
            setProfile({ name: data.name, email: data.email, phone: data.phone || "", password: "" });
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatePayload: any = { name: profile.name, phone: profile.phone };
            if (profile.password) {
                updatePayload.password = profile.password;
            }
            await fetchApi("/client/profile", {
                method: "PUT",
                body: JSON.stringify(updatePayload)
            });
            alert("Profile updated successfully");
            setProfile(prev => ({ ...prev, password: "" }));
        } catch (err: any) {
            alert(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="py-24 text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h2>
                <p className="text-muted-foreground">Please sign in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="pb-16 pt-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-10 border-b border-border/50 pb-8 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
                    <UserCircle className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-4xl font-extrabold text-foreground mb-2 tracking-tight">
                    Account Settings
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage your personal information and security preferences.
                </p>
            </div>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <span className="font-medium animate-pulse">Loading profile data...</span>
                </div>
            ) : (
                <form onSubmit={handleSave} className="bg-card border border-border/60 rounded-3xl p-8 shadow-xl shadow-primary/5">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-accent" /> Profile Information
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    type="text" 
                                    required
                                    value={profile.name}
                                    onChange={e => setProfile({...profile, name: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    type="email" 
                                    disabled
                                    value={profile.email}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    type="tel" 
                                    value={profile.phone}
                                    onChange={e => setProfile({...profile, phone: e.target.value})}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                                />
                            </div>
                        </div>

                        <hr className="border-border/50 my-8" />

                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-accent" /> Security
                        </h2>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">New Password (Optional)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    type="password" 
                                    value={profile.password}
                                    onChange={e => setProfile({...profile, password: e.target.value})}
                                    placeholder="Leave blank to keep current password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20 ml-auto"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                                ) : (
                                    <><Save className="w-5 h-5" /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

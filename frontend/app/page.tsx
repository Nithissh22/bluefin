"use client";
import Link from "next/link";
import { Users, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    const portals = [
        {
            title: "Client Portal",
            icon: Users,
            tag: "Access Level: 10 Users",
            link: "/login?role=client",
            features: [
                "Secure Client Authentication",
                "Product & Category Catalog",
                "Place Online Requisitions",
                "Requisition History & Tracking",
                "Automated Notifications"
            ]
        },
        {
            title: "Staff Portal",
            icon: UserCheck,
            tag: "Access Level: 10 Users",
            link: "/login?role=staff",
            features: [
                "Secure Staff Authentication",
                "View Assigned Requisitions",
                "Update Fulfillment Status",
                "Packing & Shipping Logistics",
                "Delivery Confirmation Logging"
            ]
        },
        {
            title: "Admin Panel",
            icon: ShieldCheck,
            tag: "Access Level: 2 Users",
            link: "/login?role=admin",
            features: [
                "Secure Admin Authentication",
                "Global Dashboard & Analytics",
                "User & Access Management",
                "Product Database Control",
                "Requisition Assignment"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background relative flex flex-col items-center">
            
            {/* Top Navy Block with Texture */}
            <div className="absolute top-0 left-0 w-full h-[55vh] bg-primary overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: `24px 24px`
                }}></div>
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-primary to-transparent opacity-50 pointer-events-none"></div>
            </div>

            <div className="w-full max-w-6xl px-6 flex flex-col z-10 pt-28 pb-24">
                
                {/* Hero Section */}
                <div className="mb-16 flex flex-col items-center text-center">
                    <div className="text-[11px] font-bold tracking-[0.2em] text-primary-foreground/60 uppercase mb-8 border border-primary-foreground/20 px-3 py-1.5 rounded-sm">
                        System Access
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-primary-foreground mb-6 drop-shadow-sm">
                        Select your portal
                    </h1>
                    
                    <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl leading-relaxed font-light">
                        Identify your assigned role below to access the corresponding dashboard and operational features.
                    </p>
                </div>

                {/* 3-Column Card Grid Overlapping the background */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                    {portals.map((portal, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                            key={i}
                        >
                            <Link 
                                href={portal.link} 
                                className="group flex flex-col h-full bg-card hover:bg-card border-x border-b border-border shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-primary transition-all duration-300 rounded-lg overflow-hidden relative transform hover:-translate-y-1"
                                aria-label={`Access ${portal.title}`}
                            >
                                {/* Accent Top Border */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-accent group-hover:bg-accent/80 transition-colors"></div>

                                <div className="p-8 flex-1 flex flex-col mt-2">
                                    <div className="mb-8 flex items-center justify-between">
                                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border border-border/60 group-hover:border-accent/40 transition-colors">
                                            <portal.icon className="w-5 h-5 text-accent" strokeWidth={2} />
                                        </div>
                                        <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-sm border border-border/40">
                                            {portal.tag.replace("Access Level: ", "")}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-6">
                                        {portal.title}
                                    </h3>
                                    
                                    <div className="flex-1">
                                        <ul className="space-y-3.5">
                                            {portal.features.map((feature, j) => (
                                                <li key={j} className="flex items-start gap-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-accent/60 transition-colors mt-2 flex-shrink-0"></div>
                                                    <span className="text-sm text-muted-foreground leading-relaxed font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="mt-10 flex items-center text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                                        Access Portal <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

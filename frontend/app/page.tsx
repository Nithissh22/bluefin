"use client";
import Link from "next/link";
import { Users, UserCheck, ShieldCheck, ArrowRight, Activity, Beaker } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
    const portals = [
        {
            title: "Client Portal",
            icon: Users,
            description: "Access procurement ledgers, track priority orders, and manage fulfillment.",
            link: "/login?role=client",
            color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
        },
        {
            title: "Staff Portal",
            icon: UserCheck,
            description: "Logistics command center. Update fulfillment status and packing metrics.",
            link: "/login?role=staff",
            color: "bg-teal-500/10 text-teal-600 border-teal-500/20"
        },
        {
            title: "Admin Panel",
            icon: ShieldCheck,
            description: "Global root access. Oversee user governance and catalog intelligence.",
            link: "/login?role=admin",
            color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden font-sans">
            
            {/* Left Content Half */}
            <div className="w-full md:w-[55%] flex flex-col justify-center px-8 md:px-20 py-16 md:py-24 z-10 bg-background/80 backdrop-blur-xl border-r border-border/50 relative">
                
                {/* Brand Header */}
                <div className="absolute top-8 left-8 md:left-12 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Beaker className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-bold text-xl tracking-tight leading-none text-foreground">Bluefin</h2>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Bio Science</span>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-xl mt-12 md:mt-0"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-8">
                        <Activity className="w-3.5 h-3.5" />
                        System Active // v2.0
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                        Precision <br/><span className="text-primary">Procurement.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light mb-12 max-w-lg">
                        The unified intelligent platform for clinical supply chain management and automated laboratory requisitions.
                    </p>

                    <div className="flex flex-col gap-4 w-full">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-2">Select Authenticated Environment</h3>
                        
                        {portals.map((portal, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                                key={i}
                            >
                                <Link 
                                    href={portal.link} 
                                    className="group flex items-center gap-5 p-5 rounded-2xl bg-card border border-border/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${portal.color}`}>
                                        <portal.icon className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                            {portal.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground truncate font-medium mt-0.5">
                                            {portal.description}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Graphic Half */}
            <div className="hidden md:flex w-[45%] relative bg-[#020814] items-center justify-center overflow-hidden">
                <Image 
                    src="/biotech_hero.png" 
                    alt="Biotechnology Visualization" 
                    fill
                    priority
                    className="object-cover opacity-90 mix-blend-lighten"
                />
                
                {/* Subtle Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#020814] via-transparent to-[#020814] opacity-50"></div>
                
                {/* Floating Metric Badges for SaaS feel */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 shadow-2xl"
                >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-xl">99.99%</div>
                        <div className="text-white/60 text-xs font-mono uppercase tracking-widest">Uptime SLA</div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

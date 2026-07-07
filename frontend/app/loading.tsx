"use client";
import React, { useEffect, useState } from "react";

export default function Loading() {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate random particles for the burst effect
    const particles = Array.from({ length: 30 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 150;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 100; // biased upwards
        const delay = Math.random() * 0.5;
        const duration = 1 + Math.random() * 1.5;
        const size = 2 + Math.random() * 6;
        return { id: i, tx, ty, delay, duration, size };
    });

    // Generate bubbles for inside the beaker
    const bubbles = Array.from({ length: 15 }).map((_, i) => {
        const x = 35 + Math.random() * 30; // restricted to beaker width roughly
        const delay = Math.random() * 2;
        const duration = 1.5 + Math.random() * 1.5;
        const size = 3 + Math.random() * 5;
        return { id: i, x, delay, duration, size };
    });

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl overflow-hidden">
            <div className="relative flex flex-col items-center justify-center">
                
                {/* Advanced Beaker SVG Animation */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                    
                    {/* Burst Particles */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
                        {particles.map(p => (
                            <div 
                                key={`burst-${p.id}`}
                                className="absolute rounded-full bg-primary"
                                style={{
                                    width: `${p.size}px`,
                                    height: `${p.size}px`,
                                    boxShadow: '0 0 10px var(--primary-color), 0 0 20px var(--primary-color)',
                                    animation: `particle-burst ${p.duration}s ease-out infinite`,
                                    animationDelay: `${p.delay}s`,
                                    '--tx': `${p.tx}px`,
                                    '--ty': `${p.ty}px`,
                                } as React.CSSProperties}
                            />
                        ))}
                    </div>

                    <svg viewBox="0 0 100 120" className="w-40 h-48 z-10 overflow-visible">
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                            <filter id="liquidGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComponentTransfer in="blur" result="glow">
                                    <feFuncA type="linear" slope="1.5"/>
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                            </linearGradient>
                            <clipPath id="beakerClip">
                                <path d="M 40 10 L 40 40 L 20 95 C 15 105 20 110 30 110 L 70 110 C 80 110 85 105 80 95 L 60 40 L 60 10 Z" />
                            </clipPath>
                        </defs>

                        {/* Beaker Back Glass */}
                        <path 
                            d="M 38 10 L 38 40 L 18 95 C 13 105 18 110 28 110 L 72 110 C 82 110 87 105 82 95 L 62 40 L 62 10 Z" 
                            fill="rgba(255,255,255,0.02)" 
                        />

                        {/* Liquid Container */}
                        <g clipPath="url(#beakerClip)">
                            {/* Animated Liquid level */}
                            <path 
                                d="M 0 60 Q 25 50 50 60 T 100 60 L 100 120 L 0 120 Z" 
                                fill="url(#liquidGrad)"
                                filter="url(#liquidGlow)"
                                className="animate-liquid-wave"
                            />
                            
                            {/* Internal Bubbles */}
                            {bubbles.map(b => (
                                <circle 
                                    key={`bubble-${b.id}`}
                                    cx={b.x} 
                                    cy="110" 
                                    r={b.size / 2} 
                                    fill="rgba(255,255,255,0.8)"
                                    className="animate-bubble"
                                    style={{
                                        animationDuration: `${b.duration}s`,
                                        animationDelay: `${b.delay}s`
                                    }}
                                />
                            ))}
                        </g>

                        {/* Beaker Outline (Glass) */}
                        <path 
                            d="M 40 10 L 40 40 L 20 95 C 15 105 20 110 30 110 L 70 110 C 80 110 85 105 80 95 L 60 40 L 60 10" 
                            fill="none" 
                            stroke="hsl(var(--foreground))" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            filter="url(#glow)"
                        />
                        {/* Beaker Lip */}
                        <ellipse cx="50" cy="10" rx="15" ry="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" filter="url(#glow)"/>
                        
                        {/* Reflections */}
                        <path d="M 28 90 L 42 50" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
                    </svg>

                </div>

                <div className="mt-8 text-center relative z-10">
                    <span className="text-xl sm:text-2xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-sm uppercase">
                        Synthesizing
                    </span>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: "200ms" }}></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" style={{ animationDelay: "400ms" }}></div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes particle-burst {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(var(--tx), var(--ty)) scale(0);
                        opacity: 0;
                    }
                }
                
                @keyframes liquid-wave {
                    0% {
                        d: path("M 0 65 Q 25 55 50 65 T 100 65 L 100 120 L 0 120 Z");
                    }
                    50% {
                        d: path("M 0 60 Q 25 70 50 60 T 100 60 L 100 120 L 0 120 Z");
                    }
                    100% {
                        d: path("M 0 65 Q 25 55 50 65 T 100 65 L 100 120 L 0 120 Z");
                    }
                }

                @keyframes bubble-rise {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 0;
                    }
                    20% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-60px) scale(1.5);
                        opacity: 0;
                    }
                }

                .animate-liquid-wave {
                    animation: liquid-wave 3s ease-in-out infinite;
                }

                .animate-bubble {
                    animation: bubble-rise linear infinite;
                }
            `}</style>
        </div>
    );
}

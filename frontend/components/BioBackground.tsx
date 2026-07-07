"use client";
import { motion } from "framer-motion";
import { Hexagon, Activity, CircleDashed, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function BioBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Generate random positions and animations for abstract biological elements
    const elements = Array.from({ length: 15 }).map((_, i) => {
        const type = i % 4; // 0: Hexagon (Chemical), 1: Activity (Pulse), 2: Circle (Cell), 3: Plus (Medical)
        const size = Math.random() * 40 + 20; // 20px to 60px
        const xStart = Math.random() * 100; // 0% to 100% vw
        const yStart = Math.random() * 100; // 0% to 100% vh
        
        // Randomize animation movement
        const xMove = (Math.random() - 0.5) * 15; // Move slightly left/right
        const yMove = - (Math.random() * 20 + 10); // Always float upwards

        return { id: i, type, size, xStart, yStart, xMove, yMove };
    });

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-[#F8FAFC]">
            {elements.map((el) => {
                return (
                    <motion.div
                        key={el.id}
                        initial={{
                            x: `${el.xStart}vw`,
                            y: `${el.yStart}vh`,
                            opacity: 0,
                            rotate: 0,
                        }}
                        animate={{
                            x: [`${el.xStart}vw`, `${el.xStart + el.xMove}vw`],
                            y: [`${el.yStart}vh`, `${el.yStart + el.yMove}vh`],
                            opacity: [0, 0.2, 0.4, 0.1, 0],
                            rotate: [0, 90, 180],
                        }}
                        transition={{
                            duration: Math.random() * 15 + 15, // 15 to 30 seconds
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * -20 // Start at different times
                        }}
                        className="absolute text-blue-500/20"
                        style={{ width: el.size, height: el.size }}
                    >
                        {el.type === 0 && <Hexagon strokeWidth={1} width="100%" height="100%" />}
                        {el.type === 1 && <Activity strokeWidth={1} width="100%" height="100%" />}
                        {el.type === 2 && <CircleDashed strokeWidth={1} width="100%" height="100%" />}
                        {el.type === 3 && <Plus strokeWidth={1} width="100%" height="100%" />}
                    </motion.div>
                );
            })}

            {/* Subtle overlay gradients for depth */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-blue-100 rounded-full blur-[150px] opacity-40 mix-blend-multiply"></div>
            <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-teal-50 rounded-full blur-[150px] opacity-60 mix-blend-multiply"></div>
        </div>
    );
}

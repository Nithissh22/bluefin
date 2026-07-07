"use client";
import { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
        { role: 'ai', content: 'Hi there! I am your Bluefin AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetchApi("/ai/chat", {
                method: "POST",
                body: JSON.stringify({ message: userMsg })
            });
            setMessages(prev => [...prev, { role: 'ai', content: response.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
            >
                <MessageSquare className="w-6 h-6" />
                <span className="font-semibold pr-2">Ask AI</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 w-80 md:w-96 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50 h-[500px] max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <h3 className="font-bold tracking-tight">Bluefin Support</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-muted/20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-background border border-border rounded-tl-sm text-foreground'}`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm text-muted-foreground flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 bg-background border-t border-border flex items-center gap-2">
                            <input 
                                type="text"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="flex-1 bg-muted px-4 py-2.5 rounded-full text-sm outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!input.trim() || loading}
                                className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

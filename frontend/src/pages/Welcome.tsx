import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startSession } from "../api/client";
import { ArrowRight, Mic, Video, BarChart2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { motion } from "framer-motion";

export const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        try {
            setLoading(true);
            const session = await startSession();
            navigate(`/session/${session.id}`);
        } catch (err) {
            console.error("Failed to start session", err);
            alert("Failed to connect to backend. Please check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-text p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
                <div className="space-y-8">
                    <motion.div variants={item} className="space-y-4">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-secondary">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Supabase Connected</span>
                        </div>
                        <h1 className="text-6xl font-bold tracking-tight">
                            Master Your <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Presence.
                            </span>
                        </h1>
                        <p className="text-xl text-secondary leading-relaxed max-w-md">
                            The intelligent video interview practice tool. Get objective data on
                            your delivery, content, and pacing.
                        </p>
                    </motion.div>

                    <motion.div variants={item} className="flex gap-4">
                        <Button
                            onClick={handleStart}
                            isLoading={loading}
                            size="lg"
                            className="text-lg"
                        >
                            Start Session <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="lg" onClick={() => navigate("/history")}>
                            View History
                        </Button>
                    </motion.div>

                    <motion.div
                        variants={item}
                        className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10"
                    >
                        <div>
                            <h3 className="text-2xl font-bold">4</h3>
                            <p className="text-sm text-secondary">Questions</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">AI</h3>
                            <p className="text-sm text-secondary">Analysis</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold">∞</h3>
                            <p className="text-sm text-secondary">Practice</p>
                        </div>
                    </motion.div>
                </div>

                <motion.div variants={item} className="hidden md:block">
                    <Card className="p-8 space-y-6 bg-surface/30">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-secondary">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Video Capture</p>
                                    <p className="text-xs">HD Recording & Playback</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-secondary">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <Mic className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Audio Analysis</p>
                                    <p className="text-xs">Pace, Filler Words & Clarity</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-secondary">
                                <div className="p-3 rounded-lg bg-white/5">
                                    <BarChart2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Smart Metrics</p>
                                    <p className="text-xs">Data-driven feedback loop</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    );
};

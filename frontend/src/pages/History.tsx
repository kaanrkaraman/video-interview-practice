import React, { useEffect, useState } from "react";
import { getAllSessions, getVideoUrl, Session } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Play, FileQuestion, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const History: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);

    useEffect(() => {
        getAllSessions()
            .then(setSessions)
            .finally(() => setLoading(false));
    }, []);

    const handlePlay = async (sessionId: string, questionId: string) => {
        try {
            setVideoError(null);
            const url = await getVideoUrl(sessionId, questionId);
            setPlayingUrl(url);
        } catch (err) {
            console.error(err);
            setVideoError("Video recording not found or expired.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-text p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Button>
                    <h1 className="text-4xl font-bold">Session History</h1>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-secondary">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <Card className="p-12 text-center bg-white/5 border-white/5">
                        <p className="text-secondary text-lg mb-4">No sessions found.</p>
                        <Button onClick={() => navigate("/")} variant="primary">
                            Start your first session
                        </Button>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map((session) => (
                            <Card
                                key={session.id}
                                className="bg-white/5 border-white/10 overflow-hidden"
                            >
                                <div
                                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() =>
                                        setExpandedSession(
                                            expandedSession === session.id ? null : session.id
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">
                                                {new Date(session.created_at).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </p>
                                            <p className="text-sm text-secondary">
                                                {new Date(session.created_at).toLocaleTimeString()}{" "}
                                                • {session.questions.length} Questions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium px-3 py-1 bg-white/10 rounded-full uppercase tracking-wider text-secondary">
                                        {session.status}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedSession === session.id && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden border-t border-white/10 bg-black/20"
                                        >
                                            <div className="p-6 space-y-4">
                                                {session.questions.map((q, idx) => (
                                                    <div
                                                        key={q.id}
                                                        className="flex gap-4 items-start p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                    >
                                                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <div className="flex-grow">
                                                            <p className="font-medium text-lg mb-1">
                                                                {q.text}
                                                            </p>
                                                            <span className="text-xs uppercase tracking-wide text-secondary bg-black/30 px-2 py-1 rounded">
                                                                {q.category}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePlay(session.id, q.id);
                                                            }}
                                                            className="mr-2"
                                                        >
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Watch Answer
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    `/session/${session.id}/dashboard`
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center">
                                                                <FileQuestion className="w-4 h-4 mr-2" />
                                                                Analysis
                                                            </div>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Modal Overlay */}
            <AnimatePresence>
                {playingUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setPlayingUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full aspect-video relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <video
                                src={playingUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={() => setPlayingUrl(null)}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Notification */}
            <AnimatePresence>
                {videoError && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 right-8 bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-lg backdrop-blur flex items-center gap-3"
                    >
                        <AlertCircle className="w-6 h-6" />
                        <div>
                            <p className="font-bold">Playback Error</p>
                            <p className="text-sm opacity-90">{videoError}</p>
                        </div>
                        <button
                            onClick={() => setVideoError(null)}
                            className="ml-4 opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

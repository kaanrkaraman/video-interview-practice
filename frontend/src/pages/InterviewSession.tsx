import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, uploadRecording, Session } from "../api/client";
import { useMediaRecorder } from "../hooks/useMediaRecorder";
import { Mic, CheckCircle, Video, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "LOADING" | "PREP" | "RECORDING" | "UPLOADING" | "COMPLETED";

export const InterviewSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [session, setSession] = useState<Session | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("LOADING");
    const [timeLeft, setTimeLeft] = useState(0);

    const { stream, startCamera, startRecording, stopRecording } = useMediaRecorder();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!sessionId) return;
        getSession(sessionId)
            .then((s) => {
                setSession(s);
                setPhase("PREP");
                setTimeLeft(30);
                startCamera();
            })
            .catch((err) => {
                console.error(err);
                alert("Failed to load session");
            });
    }, [sessionId, startCamera]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, phase]);

    useEffect(() => {
        if (phase === "RECORDING") {
            startRecording();
        }
    }, [phase, startRecording]);

    const handleNext = async () => {
        if (phase === "RECORDING") {
            setPhase("UPLOADING");
            try {
                const blob = await stopRecording();
                if (session) {
                    const qId = session.questions[currentQuestionIndex].id;
                    await uploadRecording(session.id, qId, blob);
                }
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed, but continuing...");
            }
        }

        if (session && currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setPhase("PREP");
            setTimeLeft(30);
        } else {
            setPhase("COMPLETED");
            stopRecording();
        }
    };

    const handleTimerComplete = () => {
        if (phase === "PREP") {
            setPhase("RECORDING");
            setTimeLeft(120);
        } else if (phase === "RECORDING") handleNext();
    };

    useEffect(() => {
        if (timeLeft <= 0) {
            const timeoutId = setTimeout(() => {
                handleTimerComplete();
            }, 0);
            return () => clearTimeout(timeoutId);
        }
        const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, phase]);

    const currentQuestion = session?.questions[currentQuestionIndex];

    if (phase === "LOADING")
        return (
            <div className="flex h-screen items-center justify-center bg-background text-text">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );

    if (phase === "COMPLETED")
        return (
            <div className="flex h-screen items-center justify-center bg-background text-text p-4 relative overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-4xl font-bold">Session Completed!</h1>
                    <p className="text-secondary text-lg">
                        Your answers have been uploaded for analysis.
                    </p>
                    <div className="flex justify-center gap-4 pt-8">
                        <Button onClick={() => navigate("/")} variant="outline">
                            Back to Home
                        </Button>
                        <Button onClick={() => alert("Analysis Dashboard coming soon!")}>
                            View Results
                        </Button>
                    </div>
                </motion.div>
            </div>
        );

    return (
        <div className="min-h-screen bg-background text-text p-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-0 w-full h-1 bg-white/5">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${(currentQuestionIndex / (session?.questions.length || 1)) * 100}%`,
                    }}
                />
            </div>

            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-8 pt-6">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-secondary uppercase tracking-widest">
                        Question {currentQuestionIndex + 1}/{session?.questions.length}
                    </span>
                </div>
                <div
                    className={cn(
                        "px-6 py-2 rounded-full font-mono text-xl font-bold transition-all border",
                        phase === "PREP"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : phase === "RECORDING"
                                ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
                                : "bg-white/5 border-white/10"
                    )}
                >
                    {phase === "UPLOADING" ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion?.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8 order-2 lg:order-1"
                    >
                        <div className="space-y-6">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-accent uppercase tracking-wider">
                                {currentQuestion?.category}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {currentQuestion?.text}
                            </h2>
                        </div>

                        <Card className="p-6 bg-white/5 border-white/5">
                            <div className="flex gap-4 items-start text-secondary">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <Video className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-sm">
                                    <p className="text-white font-medium mb-1">
                                        {phase === "PREP" ? "Preparation Time" : "Recording Answer"}
                                    </p>
                                    <p>
                                        {phase === "PREP"
                                            ? "Take a deep breath. Structure your thoughts. Recording starts automatically."
                                            : "Speak clearly. Maintain eye contact with the camera."}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div className="flex gap-4">
                            {phase === "PREP" && (
                                <Button
                                    onClick={() => {
                                        setPhase("RECORDING");
                                        setTimeLeft(120);
                                    }}
                                    variant="danger"
                                    size="lg"
                                    className="w-full md:w-auto"
                                >
                                    <Mic className="w-5 h-5 mr-2" />
                                    Start Now
                                </Button>
                            )}

                            {phase === "RECORDING" && (
                                <Button
                                    onClick={handleNext}
                                    variant="primary"
                                    size="lg"
                                    className="w-full md:w-auto"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Finish Answer
                                </Button>
                            )}
                            {phase === "UPLOADING" && (
                                <Button disabled className="w-full md:w-auto">
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Camera View */}
                <motion.div
                    layout
                    className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 order-1 lg:order-2"
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />

                    {phase === "RECORDING" && (
                        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-md text-white rounded-full text-sm font-bold animate-pulse shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            REC
                        </div>
                    )}

                    {phase === "PREP" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-8 text-center">
                            <h3 className="text-3xl font-bold text-white mb-4">Preparation Time</h3>
                            <div className="text-8xl font-black text-blue-400 mb-6 font-mono">
                                {timeLeft}
                            </div>
                            <p className="text-white/80 font-medium text-lg">
                                Take a deep breath. Recording starts automatically.
                            </p>
                            <Button
                                onClick={() => {
                                    setPhase("RECORDING");
                                    setTimeLeft(120);
                                }}
                                variant="outline"
                                className="mt-8 border-white/20 hover:bg-white/10 text-white"
                            >
                                Start Recording Now
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

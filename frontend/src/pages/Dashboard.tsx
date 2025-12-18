import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnalysis, triggerAnalysis, AnalysisResult, getSession, Session } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ArrowLeft, Loader2, BarChart2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export const Dashboard: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResult[] | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const load = async () => {
            try {
                const s = await getSession(sessionId);
                setSession(s);

                try {
                    const data = await getAnalysis(sessionId);
                    if (data && data.length > 0) {
                        setResults(data);
                    }
                } catch {

                }
            } catch (err) {
                console.error(err);
                setError("Failed to load session data.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [sessionId]);

    const handleAnalyze = async () => {
        if (!sessionId) return;
        setAnalyzing(true);
        try {
            const data = await triggerAnalysis(sessionId);
            setResults(data);
        } catch (err) {
            console.error(err);
            alert("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center bg-background text-text">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );

    if (error)
        return (
            <div className="flex h-screen items-center justify-center bg-background text-text flex-col gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p>{error}</p>
                <Button onClick={() => navigate("/history")}>Back to History</Button>
            </div>
        );

    return (
        <div className="min-h-screen bg-background text-text p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate("/history")}>
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Analysis Dashboard</h1>
                            <p className="text-secondary text-sm">
                                Session on{" "}
                                {session ? new Date(session.created_at).toLocaleDateString() : ""}
                            </p>
                        </div>
                    </div>
                    {results && (
                        <Button variant="outline" onClick={handleAnalyze} isLoading={analyzing}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Re-Analyze
                        </Button>
                    )}
                </div>

                {!results ? (
                    <Card className="p-12 text-center bg-white/5 border-white/5 space-y-6">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-400">
                            <BarChart2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Ready to Analyze?</h2>
                            <p className="text-secondary max-w-md mx-auto">
                                Our AI will generate transcripts, score your performance, and
                                provide actionable feedback for every answer.
                            </p>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            isLoading={analyzing}
                            size="lg"
                            className="px-8"
                        >
                            {analyzing ? "Analyzing Session..." : "Start AI Analysis"}
                        </Button>
                        {analyzing && (
                            <p className="text-sm text-secondary animate-pulse">
                                This may take a few minutes...
                            </p>
                        )}
                    </Card>
                ) : (
                    <div className="space-y-12">
                        {results.map((item, idx) => (
                            <motion.div
                                key={item.question_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="space-y-6"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 font-bold border border-white/10">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-2xl font-bold leading-tight">
                                        {item.question_text}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Scores */}
                                    <Card className="p-6 bg-white/5 space-y-6">
                                        <h4 className="font-bold text-secondary uppercase tracking-wider text-xs border-b border-white/10 pb-2">
                                            Performance Scores
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <ScoreBadge
                                                label="Clarity"
                                                score={item.analysis.clarity_score}
                                            />
                                            <ScoreBadge
                                                label="Pace"
                                                score={item.analysis.pace_score}
                                            />
                                            <ScoreBadge
                                                label="Confidence"
                                                score={item.analysis.confidence_score}
                                            />
                                            <ScoreBadge
                                                label="Content"
                                                score={item.analysis.content_score}
                                            />
                                        </div>
                                    </Card>

                                    {/* Feedback */}
                                    <Card className="p-6 bg-white/5 md:col-span-2 space-y-6">
                                        <div>
                                            <h4 className="font-bold text-secondary uppercase tracking-wider text-xs mb-3">
                                                AI Feedback
                                            </h4>
                                            <p className="text-lg leading-relaxed">
                                                {item.analysis.feedback_text}
                                            </p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                                            <div>
                                                <h5 className="font-bold text-green-400 mb-2 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Key
                                                    Takeaways
                                                </h5>
                                                <ul className="space-y-2 text-sm text-secondary list-disc pl-4">
                                                    {item.analysis.key_takeaways.map((point, i) => (
                                                        <li key={i}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                                    <RefreshCw className="w-4 h-4" /> Improvements
                                                </h5>
                                                <ul className="space-y-2 text-sm text-secondary list-disc pl-4">
                                                    {item.analysis.improvements.map((point, i) => (
                                                        <li key={i}>{point}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Transcript Accordion (Simple) */}
                                <details className="group bg-black/20 rounded-lg overflow-hidden border border-white/5">
                                    <summary className="p-4 cursor-pointer font-medium text-secondary hover:text-white transition-colors flex items-center gap-2">
                                        <span className="group-open:rotate-90 transition-transform">
                                            ▸
                                        </span>{" "}
                                        Show Transcript
                                    </summary>
                                    <div className="p-6 pt-0 text-sm leading-relaxed text-secondary/80 border-t border-white/5 mt-2">
                                        {item.transcript}
                                    </div>
                                </details>

                                <div className="h-px bg-white/10 w-full" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ScoreBadge = ({ label, score }: { label: string; score: number }) => {
    const color =
        score >= 90
            ? "text-green-400 border-green-500/30 bg-green-500/10"
            : score >= 70
                ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                : score >= 50
                    ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                    : "text-red-400 border-red-500/30 bg-red-500/10";

    return (
        <div
            className={`flex flex-col items-center justify-center p-4 rounded-xl border ${color} transition-all`}
        >
            <span className="text-3xl font-black font-mono mb-1">{score}</span>
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</span>
        </div>
    );
};

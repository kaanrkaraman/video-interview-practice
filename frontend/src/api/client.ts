import axios from "axios";

const API_URL = "http://localhost:8000";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface Question {
    id: string;
    text: string;
    category: string;
}

export interface Session {
    id: string;
    questions: Question[];
    status: string;
    created_at: string;
}

export const startSession = async (): Promise<Session> => {
    const response = await api.post<Session>("/session/");
    return response.data;
};

export const getSession = async (sessionId: string): Promise<Session> => {
    const response = await api.get<Session>(`/session/${sessionId}`);
    return response.data;
};

export const uploadRecording = async (sessionId: string, questionId: string, blob: Blob) => {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("question_id", questionId);

    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    formData.append("file", blob, `recording.${ext}`);

    const response = await api.post<{ path: string; status: string }>("/ingest/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getAllSessions = async (): Promise<Session[]> => {
    const response = await api.get<Session[]>("/session/history/all");
    return response.data;
};

export const getVideoUrl = async (sessionId: string, questionId: string): Promise<string> => {
    const response = await api.get<{ url: string }>(
        `/session/${sessionId}/question/${questionId}/video`
    );
    return response.data.url;
};

export interface AnalysisResult {
    question_id: string;
    question_text: string;
    transcript: string;
    analysis: {
        clarity_score: number;
        pace_score: number;
        confidence_score: number;
        content_score: number;
        feedback_text: string;
        improvements: string[];
        key_takeaways: string[];
    };
}

export const triggerAnalysis = async (sessionId: string): Promise<AnalysisResult[]> => {
    const response = await api.post<{ status: string; data: AnalysisResult[] }>(
        `/session/${sessionId}/analyze`
    );
    return response.data.data;
};

export const getAnalysis = async (sessionId: string): Promise<AnalysisResult[]> => {
    const response = await api.get<AnalysisResult[]>(`/session/${sessionId}/analysis`);
    return response.data;
};

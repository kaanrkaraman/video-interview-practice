import { useState, useRef, useCallback } from "react";

export const useMediaRecorder = () => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(stream);
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    }, [stream]);

    const startRecording = useCallback(() => {
        if (!stream) return;
        chunksRef.current = [];

        const mimeTypes = ["video/mp4", "video/webm;codecs=vp9", "video/webm"];

        let selectedMimeType = "video/webm";
        for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                selectedMimeType = type;
                break;
            }
        }

        console.log(`Using MIME type: ${selectedMimeType}`);
        const recorder = new MediaRecorder(stream, { mimeType: selectedMimeType });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setRecording(true);
    }, [stream]);

    const stopRecording = useCallback(async (): Promise<Blob> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current) {
                resolve(new Blob([]));
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                const mimeType = mediaRecorderRef.current?.mimeType || "video/webm";
                const blob = new Blob(chunksRef.current, { type: mimeType });
                chunksRef.current = [];
                setRecording(false);
                resolve(blob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    return {
        stream,
        startCamera,
        stopCamera,
        startRecording,
        stopRecording,
        isRecording: recording,
    };
};

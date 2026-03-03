// src/components/CameraScanner.tsx
// Opens the device camera and captures a frame every 1.5 s for OCR.

import { useEffect, useRef, useCallback } from "react";

interface CameraScannerProps {
  scanning: boolean;
  onFrame: (imageData: string) => void;
  onError: (msg: string) => void;
}

export function CameraScanner({ scanning, onFrame, onError }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Capture a single frame and emit it ──────────────────────────────────
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw raw frame
    ctx.drawImage(video, 0, 0);

    // Grayscale + contrast boost — improves Tesseract accuracy on bill text
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      // Luminance-weighted grayscale
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Simple contrast stretch: push toward black/white
      const contrast = Math.min(255, Math.max(0, (gray - 128) * 1.6 + 128));
      data[i] = data[i + 1] = data[i + 2] = contrast;
    }
    ctx.putImageData(frame, 0, 0);

    onFrame(canvas.toDataURL("image/png"));
  }, [onFrame]);

  // ── Start camera ────────────────────────────────────────────────────────
  useEffect(() => {
    let stopped = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (stopped) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (!stopped) {
          onError(
            err instanceof Error
              ? err.message
              : "Could not access camera. Please allow camera permission."
          );
        }
      }
    }

    startCamera();

    return () => {
      stopped = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [onError]);

  // ── Capture loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (scanning) {
      intervalRef.current = setInterval(captureFrame, 1500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [scanning, captureFrame]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full rounded-2xl object-cover shadow-lg transition-all duration-300 ${
          scanning ? "ring-4 ring-blue-400 ring-offset-2 animate-pulse-ring" : ""
        }`}
      />

      {/* Scanning overlay */}
      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-blue-300 rounded-lg w-3/4 h-16 opacity-70" />
        </div>
      )}

      {/* Hidden canvas used for frame capture & preprocessing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

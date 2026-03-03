// src/App.tsx
// Root component — wires camera → OCR → serial check → result UI.

import { useState, useCallback, useRef } from "react";
import { CameraScanner } from "./components/CameraScanner";
import { useOcr } from "./components/OcrProcessor";
import { ResultBadge } from "./components/ResultBadge";
import { isFake, type FakeSeries } from "./data/fake-series";
import { parseSerial } from "./lib/serial-parser";

type ScanState = "idle" | "scanning" | "result";

export default function App() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<"genuine" | "fake" | null>(null);
  const [detectedSerial, setDetectedSerial] = useState<string | null>(null);
  const [matchedSeries, setMatchedSeries] = useState<FakeSeries | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Prevent processing after a result is shown
  const lockedRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── OCR result handler ──────────────────────────────────────────────────
  const handleOcrResult = useCallback(
    ({ text, confidence }: { text: string; confidence: number }) => {
      if (lockedRef.current) return;
      if (confidence < 20) return; // ignore very low-confidence frames

      const serial = parseSerial(text);
      if (!serial) return; // no serial found in this frame, keep scanning

      lockedRef.current = true;
      setScanState("result");

      // serial is e.g. "020320870 B" — split into numeric part and letter suffix
      const [numPart, seriesLetter] = serial.split(" ");
      const serialNum = parseInt(numPart, 10);
      const fakeSeries = isNaN(serialNum) ? null : isFake(serialNum, seriesLetter);

      setDetectedSerial(serial);
      setMatchedSeries(fakeSeries);
      setResult(fakeSeries ? "fake" : "genuine");

      // Auto-reset after 4 s
      resetTimerRef.current = setTimeout(() => resetScan(), 4000);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { processImage } = useOcr(handleOcrResult);

  // ── Frame handler — only pass frames while scanning ─────────────────────
  const handleFrame = useCallback(
    (dataUrl: string) => {
      if (scanState === "scanning" && !lockedRef.current) {
        processImage(dataUrl);
      }
    },
    [scanState, processImage]
  );

  // ── Reset ────────────────────────────────────────────────────────────────
  function resetScan() {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    lockedRef.current = false;
    setResult(null);
    setDetectedSerial(null);
    setMatchedSeries(null);
    setScanState("scanning");
  }

  function startScanning() {
    lockedRef.current = false;
    setScanState("scanning");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="text-yellow-400">El Pillador</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Fake Bill Detector</p>
      </header>

      {/* Camera error */}
      {cameraError && (
        <div className="mb-4 bg-red-900/60 border border-red-500 rounded-xl px-4 py-3 text-sm text-red-200 max-w-md text-center">
          {cameraError}
        </div>
      )}

      {/* Camera feed */}
      <CameraScanner
        scanning={scanState === "scanning"}
        onFrame={handleFrame}
        onError={setCameraError}
      />

      {/* Status / CTA */}
      <div className="mt-6 text-center">
        {scanState === "idle" && (
          <button
            onClick={startScanning}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-950 font-bold text-lg px-8 py-3 rounded-full shadow-lg transition"
          >
            Start Scanning
          </button>
        )}

        {scanState === "scanning" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-blue-300 font-medium animate-pulse">
              Scanning… point camera at serial number
            </p>
            <button
              onClick={() => setScanState("idle")}
              className="text-gray-500 text-xs underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Result overlay */}
      <ResultBadge
        result={result}
        serial={detectedSerial}
        matchedSeries={matchedSeries}
        onDismiss={resetScan}
      />
    </div>
  );
}

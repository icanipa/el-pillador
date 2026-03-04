// src/components/ResultBadge.tsx
// Displays GENUINE ✅ or FAKE ❌ result with contextual info.

import type { FakeSeries } from "../data/fake-series";

type ScanResult = "genuine" | "fake" | null;

interface ResultBadgeProps {
  result: ScanResult;
  serial: string | null;
  matchedSeries: FakeSeries | null;
  onDismiss: () => void;
}

export function ResultBadge({
  result,
  serial,
  matchedSeries,
  onDismiss,
}: ResultBadgeProps) {
  if (!result) return null;

  const isGenuine = result === "genuine";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center
        transition-all duration-300 cursor-pointer
        ${isGenuine ? "bg-green-600/90" : "bg-red-600/90"}`}
      onClick={onDismiss}
    >
      {/* Icon */}
      <div className="text-8xl mb-6 animate-bounce-once">
        {isGenuine ? "✅" : "❌"}
      </div>

      {/* Status label */}
      <h1 className="text-white text-5xl font-black tracking-wide drop-shadow mb-4">
        {isGenuine ? "VÁLIDO" : "FALSO"}
      </h1>

      {/* Serial number */}
      {serial && (
        <p className="text-white/90 text-xl font-mono mb-2">
          Serial: <span className="font-bold">{serial}</span>
        </p>
      )}

      {/* Series details for fake bills */}
      {!isGenuine && matchedSeries && (
        <div className="mt-2 bg-white/20 rounded-xl px-6 py-3 text-white text-center text-sm">
          {matchedSeries.currency && matchedSeries.denomination && (
            <p className="font-semibold text-base">
              Billete de {matchedSeries.denomination} {matchedSeries.currency}
            </p>
          )}
          <p>
            Rango: {matchedSeries.start.toString()} – {matchedSeries.end.toString()}
          </p>
          {matchedSeries.note && (
            <p className="opacity-80 mt-1">{matchedSeries.note}</p>
          )}
        </div>
      )}

      {/* Dismiss hint */}
      <p className="mt-10 text-white/60 text-sm">
        Toca en cualquier lugar para escanear el siguiente billete
      </p>
    </div>
  );
}

// src/components/OcrProcessor.tsx
// Wraps Tesseract.js to run OCR on image frames received as data URLs.
// Exposes a simple hook: useOcr(onResult)

import { useCallback, useEffect, useRef } from "react";
import Tesseract from "tesseract.js";

type OcrResult = { text: string; confidence: number };

/**
 * Returns a `processImage` function that runs Tesseract OCR on a data-URL
 * frame and calls `onResult` with the recognised text + confidence score.
 *
 * A single Tesseract Worker is created on mount and terminated on unmount.
 */
export function useOcr(onResult: (result: OcrResult) => void) {
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const busyRef = useRef(false);

  // Initialise worker once
  useEffect(() => {
    let destroyed = false;

    async function initWorker() {
      const worker = await Tesseract.createWorker("eng", 1);

      // Tune parameters for printed bill text
      await worker.setParameters({
        tessedit_char_whitelist:
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });

      if (destroyed) {
        await worker.terminate();
        return;
      }
      workerRef.current = worker;
    }

    initWorker().catch(console.error);

    return () => {
      destroyed = true;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const processImage = useCallback(
    async (dataUrl: string) => {
      if (busyRef.current || !workerRef.current) return;
      busyRef.current = true;

      try {
        const result = await workerRef.current.recognize(dataUrl);
        onResult({
          text: result.data.text,
          confidence: result.data.confidence,
        });
      } catch (err) {
        console.error("[OCR] Error:", err);
      } finally {
        busyRef.current = false;
      }
    },
    [onResult]
  );

  return { processImage };
}

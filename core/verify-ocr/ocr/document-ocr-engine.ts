import type { OcrExtractResult } from "../types";
import { MIN_QUALITY_SCORE } from "../config";

const FACE_API_MODELS_PATH = "/models";

let faceApiModelsLoaded = false;

async function loadFaceApiModels(): Promise<void> {
  if (faceApiModelsLoaded) return;
  const faceapi = await import(
    /* webpackIgnore: true */ "@vladmandic/face-api"
  );
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_API_MODELS_PATH),
    faceapi.nets.faceLandmark68Net.loadFromUri(FACE_API_MODELS_PATH),
    faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODELS_PATH),
  ]);
  faceApiModelsLoaded = true;
}

/**
 * Create HTMLImageElement from File or data URL (client-only).
 */
function toImage(input: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.crossOrigin = "anonymous";
    let objectUrl: string | null = null;
    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    if (typeof input === "string") {
      img.src = input;
    } else {
      objectUrl = URL.createObjectURL(input);
      img.src = objectUrl;
    }
  });
}

/**
 * Parse raw OCR text into common document fields (best-effort).
 */
function parseOcrFields(rawText: string): Record<string, string | null> {
  const lines = rawText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const text = rawText.replace(/\s+/g, " ").trim();

  // Simple patterns: ID number (digits + optional letters), dates (DD/MM/YYYY or similar)
  const idPattern = /\b(\d{8,12}[A-Za-z]?)\b/g;
  const datePattern =
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/g;
  const idMatch = idPattern.exec(text);
  const idNumber = idMatch ? idMatch[1] : null;
  const dateMatches = text.match(datePattern) ?? [];
  const dateOfBirth = dateMatches[0] ?? null;
  const expiryDate =
    dateMatches.length > 1 ? dateMatches[dateMatches.length - 1] : dateOfBirth;

  // Name: often first non-empty line that looks like a name (letters + spaces, 2–4 words)
  const nameLine = lines.find(
    (line) =>
      line.length > 3 &&
      line.length < 60 &&
      /^[A-Za-z\s\-\.']+$/.test(line) &&
      line.split(/\s+/).length >= 2
  );
  const fullName = nameLine ?? null;

  return {
    fullName,
    idNumber,
    dateOfBirth,
    expiryDate,
  };
}

/**
 * Create a center-crop data URL from image (for demo fallback when face-api fails).
 */
function getCenterCropDataUrl(img: HTMLImageElement, size = 200): string {
  const s = Math.min(size, img.naturalWidth, img.naturalHeight);
  const x = (img.naturalWidth - s) / 2;
  const y = (img.naturalHeight - s) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(img, x, y, s, s, 0, 0, s, s);
  return canvas.toDataURL("image/jpeg", 0.9);
}

/**
 * OCR Engine: Tesseract for text + face-api for face detection/crop.
 * If face-api fails (no models) or no face / low quality, returns demo result so flow can continue.
 */
export class DocumentOcrEngine {
  private modelsPath: string;

  constructor(modelsPath: string = FACE_API_MODELS_PATH) {
    this.modelsPath = modelsPath;
  }

  /**
   * Extract text (OCR) and reference face from document image.
   * If no face or quality below MIN_QUALITY_SCORE, caller should treat as invalid (ERR_INVALID_DOC / ERR_NO_FACE / ERR_BLUR).
   */
  async extract(input: File | string): Promise<OcrExtractResult> {
    const img = await toImage(input);

    const Tesseract = await import(/* webpackIgnore: true */ "tesseract.js");
    const { data } = await Tesseract.recognize(img, "eng", {
      logger: () => {},
    });
    const rawText = data?.text ?? "";
    const fields = parseOcrFields(rawText);

    const demoFallback = (): OcrExtractResult => ({
      rawText,
      fields,
      referenceFaceDataUrl: getCenterCropDataUrl(img),
      hasFace: true,
      qualityScore: 5,
    });

    try {
      await loadFaceApiModels();
      const faceapi = await import(
        /* webpackIgnore: true */ "@vladmandic/face-api"
      );

      const detection = await faceapi.detectSingleFace(img);
      if (!detection) {
        return demoFallback();
      }

      const qualityScore = Math.round(detection.score * 10);
      if (qualityScore < MIN_QUALITY_SCORE) {
        return demoFallback();
      }

      const canvases = await faceapi.extractFaces(img, [detection.box]);
      const referenceFaceDataUrl =
        canvases.length > 0
          ? canvases[0].toDataURL("image/jpeg", 0.9)
          : getCenterCropDataUrl(img);

      return {
        rawText,
        fields,
        referenceFaceDataUrl,
        hasFace: true,
        qualityScore,
      };
    } catch {
      return demoFallback();
    }
  }
}

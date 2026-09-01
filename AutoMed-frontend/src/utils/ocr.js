import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function pdfFirstPageToImage(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 }); /* higher scale = better OCR accuracy*/

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

/**
 * Runs OCR on an image or PDF file and returns the raw extracted text.
 * @param {File} file
 * @param {(status: string, progress: number) => void} onProgress
 */
export async function extractTextFromFile(file, onProgress) {
  const imageSource = file.type === 'application/pdf'
    ? await pdfFirstPageToImage(file)
    : file;

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (onProgress && m.status) onProgress(m.status, m.progress ?? 0);
    }
  });

  try {
    const { data } = await worker.recognize(imageSource);
    return data.text;
  } finally {
    await worker.terminate();
  }
}
/*
 * Heuristic parser: looks for common labelled patterns in offer letters / visa
 * documents ("Job Title: X", "Visa Code: X", etc.) and falls back gracefully
 * if nothing is found. This is intentionally simple — OCR text is noisy, so
 * we only attempt a best-effort auto-fill; the person always reviews the result.
 */
export function parseDocumentFields(rawText) {
  const text = rawText.replace(/\r/g, '');
  const result = { jobTitle: null, visaCode: null };

  const jobTitlePatterns = [
    /job\s*title\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,40})/i,
    /position\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,40})/i,
    /designation\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,40})/i,
  ];
  for (const re of jobTitlePatterns) {
    const m = text.match(re);
    if (m) { result.jobTitle = m[1].trim().replace(/\s+/g, ' '); break; }
  }

  const visaCodePatterns = [
    /visa\s*code\s*[:\-]\s*([A-Z]{2,4}-[A-Z0-9]{2,6}-?\d{0,3})/i,
    /\b([A-Z]{2,4}-[A-Z]{2,5}-\d{2})\b/,
     // fallback: bare pattern like UAE-DRV-01
  ];
  for (const re of visaCodePatterns) {
    const m = text.match(re);
    if (m) { result.visaCode = m[1].trim().toUpperCase(); break; }
  }

  return result;
}

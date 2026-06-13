import { createWorker } from "tesseract.js";

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

// Normalise un texte pour la comparaison : majuscules, sans accents, sans ponctuation.
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extrait le texte d'une image (recto/verso CNI) via OCR.
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const worker = await createWorker("fra");
  try {
    const { data } = await worker.recognize(imageBuffer);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

// Vérifie que le nom et le prénom du profil apparaissent dans le texte extrait de la CNI.
export function nameMatchesDocument(nom: string, prenom: string, ocrText: string): boolean {
  const normalizedDoc = normalizeText(ocrText);
  const nomOk = normalizeText(nom)
    .split(" ")
    .filter(Boolean)
    .every((part) => normalizedDoc.includes(part));
  const prenomOk = normalizeText(prenom)
    .split(" ")
    .filter(Boolean)
    .some((part) => normalizedDoc.includes(part));
  return nomOk && prenomOk;
}

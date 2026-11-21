import type { ConfidenceLevel } from './types';

// Confidence thresholds — configurable here.
export const CONFIDENCE_THRESHOLDS = {
  high: 90,
  moderate: 70,
};

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'High';
  if (confidence >= CONFIDENCE_THRESHOLDS.moderate) return 'Moderate';
  return 'Low';
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateImageFile(file: File): { ok: boolean; error?: string } {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const ext = name.slice(name.lastIndexOf('.'));
  if (!ACCEPTED_TYPES.includes(type) || !ACCEPTED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: 'Unsupported file. Please upload a JPG, PNG, or WebP image.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      error: 'File too large. Image size exceeds the maximum allowed size of 10 MB.',
    };
  }
  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

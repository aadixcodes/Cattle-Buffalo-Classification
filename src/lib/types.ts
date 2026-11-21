// Shared types for the classification system

export type AnimalClass = 'Cattle' | 'Buffalo';

export interface ClassProbabilities {
  cattle: number; // 0–100
  buffalo: number; // 0–100
}

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface PredictionResult {
  prediction: AnimalClass;
  confidence: number; // 0–100
  probabilities: ClassProbabilities;
  confidenceLevel: ConfidenceLevel;
  isDemo: boolean;
  durationMs: number;
}

export interface PredictionRecord {
  id: string;
  image_thumb: string | null;
  image_url: string | null;
  prediction: AnimalClass;
  confidence: number;
  cattle_prob: number;
  buffalo_prob: number;
  confidence_level: ConfidenceLevel;
  is_demo: boolean;
  created_at: string;
}

export interface ModelInfo {
  architecture: string;
  task: string;
  classes: AnimalClass[];
  inputSize: string;
  transferLearning: string;
  framework: string;
  modelLoaded: boolean;
  demoMode: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusionMatrix: number[][];
  hasMetrics: boolean;
  trainedAt: string | null;
}

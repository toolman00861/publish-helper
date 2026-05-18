export interface AnalysisResult {
  title: string;
  type: string;
  summary: string;
  score: number;
  reason: string;
}

export interface AnalysisRequest {
  text: string;
  title?: string;
  apiKey: string;
}

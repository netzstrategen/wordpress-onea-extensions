/**
 * Energy Certificate Check Component Types
 */

export type CertificateType = "bedarfsausweis" | "verbrauchsausweis" | "both";

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  tooltip?: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  next?: string; // Next question ID or 'result'
  resultHint?: CertificateType; // Hint for decision logic
}

export interface UserAnswers {
  [questionId: string]: string;
}

export interface CertificateRecommendation {
  recommended: CertificateType;
  canChoose: boolean; // If both types are valid
  reasons: string[];
}

export interface CertificateOption {
  type: CertificateType;
  title: string;
  price: string;
  priceNote: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  isRecommended: boolean;
}

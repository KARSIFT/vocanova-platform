export type ContentLearningErrorCode =
  | "invalid_cursor"
  | "invalid_input"
  | "invalid_idempotency"
  | "idempotency_conflict"
  | "meaning_not_found"
  | "situation_not_found"
  | "user_word_not_found"
  | "word_not_found";

export class ContentLearningError extends Error {
  constructor(readonly code: ContentLearningErrorCode) {
    super(code);
    this.name = "ContentLearningError";
  }
}

export interface Situation {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  levelBand?: string;
  category: string;
  displayOrder: number;
}

export interface SituationMeaning {
  meaningId: string;
  wordId: string;
  wordSlug: string;
  wordText: string;
  partOfSpeech: string;
  shortDefinition: string;
  saved: boolean;
}

export type WordReviewState =
  "due" | "new" | "learning" | "reviewing" | "mastered" | "not_reviewing";

export interface WordMeaning {
  id: string;
  partOfSpeech: string;
  shortDefinition: string;
  learnerDefinition?: string;
  saved: boolean;
  userWordId?: string;
  reviewState: WordReviewState | null;
  nextReviewAt?: string | null;
  examples: Array<{ id: string; exampleText: string; situationLabel?: string }>;
  usageNotes: Array<{ id: string; noteType: string; noteText: string }>;
}

export interface WordDetail {
  id: string;
  text: string;
  slug: string;
  wordType: string;
  difficultyLevel?: string;
  meanings: WordMeaning[];
}

export interface SavedMeaning {
  userWordId: string;
  meaningId: string;
  wordId: string;
  wordText: string;
  wordSlug: string;
  partOfSpeech: string;
  shortDefinition: string;
  status: string;
  source: string;
  saved: boolean;
  addedAt: string;
  nextReviewAt?: string | null;
}

export interface DueWord {
  userWordId: string;
  meaningId: string;
  wordId: string;
  wordText: string;
  wordSlug: string;
  partOfSpeech: string;
  shortDefinition: string;
  status: string;
  reviewStep: number;
}

export interface ReviewSubmission {
  userWordId: string;
  meaningId: string;
  attemptType?: string;
  promptType: string;
  result: string;
  rating?: string;
  answeredAt: string;
  responseTimeMs?: number;
  selectedOptionMeaningId?: string;
  typedAnswer?: string;
  wasHintUsed?: boolean;
  source?: string;
  clientAttemptId: string;
  metadata?: Record<string, unknown>;
}

export interface ReviewAttempt {
  attemptId: string;
  userWordId: string;
  meaningId: string;
  attemptType: string;
  promptType: string;
  result: string;
  rating?: string;
  reviewStepBefore: number;
  reviewStepAfter: number;
  answeredAt: string;
  responseTimeMs: number;
  selectedOptionMeaningId?: string;
  typedAnswer?: string;
  wasHintUsed: boolean;
  source: string;
  clientAttemptId: string;
  nextReviewAt: string;
}

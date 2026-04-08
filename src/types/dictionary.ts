export type DictionaryDifficulty = "beginner" | "intermediate" | "advanced";

export interface DictionaryDefinition {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export interface DictionaryTerm {
  slug: string;
  term: string;
  aliases: string[];
  category: string;
  phaseIds: string[];
  lessonIds: string[];
  definitions: DictionaryDefinition;
  examples?: {
    language: string;
    code: string;
  }[];
  seeAlso: string[];
  standards?: {
    cs2023?: string[];
    swebok?: string[];
  };
}

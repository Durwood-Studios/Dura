export type SandboxLanguage = "javascript" | "typescript" | "html" | "react";

export interface SandboxSave {
  id: string;
  title: string;
  language: SandboxLanguage;
  code: string;
  createdAt: number;
  updatedAt: number;
}

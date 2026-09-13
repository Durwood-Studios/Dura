import type { LocaleCode } from "@/lib/i18n/languages";
const SPANISH: Record<string, string> = {
  Home: "Inicio",
  Learn: "Aprender",
  Practice: "Práctica",
  Tracks: "Carreras",
  Progress: "Progreso",
  "Get Started": "Comenzar",
  Dashboard: "Panel",
  "Skill Assessment": "Evaluación inicial",
  "Career Tracks": "Rutas profesionales",
  Curriculum: "Plan de estudios",
  "How-To Guides": "Guías prácticas",
  Tutorials: "Tutoriales",
  "Discovery Zone": "Zona de descubrimiento",
  Flashcards: "Tarjetas",
  Challenge: "Desafío",
  Dojo: "Dojo",
  "Code Sandbox": "Editor de código",
  Statistics: "Estadísticas",
  Goals: "Objetivos",
  "Engineering Judgment": "Criterio de ingeniería",
  Certificates: "Certificados",
  Dictionary: "Diccionario",
  "Teacher Tools": "Herramientas docentes",
  Settings: "Configuración",
  "Sign out": "Cerrar sesión",
  "Sign in": "Iniciar sesión",
};
/** Translate the navigation's bounded label vocabulary, retaining English for untranslated labels. */
export function navigationLabel(label: string, locale: LocaleCode): string {
  return locale === "es-419" ? (SPANISH[label] ?? label) : label;
}

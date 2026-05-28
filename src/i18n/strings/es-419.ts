/**
 * Spanish (Latin America) UI strings — machine-translated baseline
 * with human refinement on the most-visible surfaces (the locale
 * picker copy + Discovery tagline + Settings section titles).
 *
 * STATUS: bounded PoC. Lesson MDX and dictionary definitions are NOT
 * translated yet — see ROADMAP §"Global reach + i18n" Phase 4 for
 * scope. The point of this file is to prove the i18n machinery works
 * end-to-end so contributors can extend it. Community translation
 * improvements welcome via PR.
 *
 * Translation flag policy: any string here that hasn't been native-
 * reviewed should carry no special marker today, but the locale
 * picker itself surfaces a "machine-translated" badge when the
 * learner selects es-419 so the social contract is honest.
 */

import type { Strings } from "./en";

export const STRINGS_ES_419: Strings = {
  locale: {
    name: "Idioma",
    hint: "Cambia el idioma de la interfaz de DURA. La traducción de lecciones y diccionario se lanza fase por fase — consulta el ROADMAP para el estado actual.",
    machineTranslatedBadge: "Traducido por máquina",
    comingSoon: "Próximamente",
  },
  discoverZone: {
    title: "Zona de Descubrimiento",
    tagline: "Veinte actividades interactivas. Sin muros de texto, sin cuenta.",
    chooseRoom: "Elige una sala",
  },
  settings: {
    appearance: "Apariencia",
    accessibility: "Accesibilidad",
    learning: "Aprendizaje",
    notifications: "Notificaciones",
    data: "Datos",
    privacy: "Privacidad",
    aiFeatures: "Funciones de IA",
    saveProgress: "Guardar progreso en archivo",
    restoreFromFile: "Restaurar desde archivo",
    clearAllData: "Borrar todos los datos",
  },
};

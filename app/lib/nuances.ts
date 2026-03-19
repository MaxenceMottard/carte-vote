// French flag blue and red
const BLUE = "#002395";
const RED = "#ED2939";
const ORANGE = "#E67E22";
const TEAL = "#0d9488";
const GREY = "#6b7280";

export const NUANCE_COLORS: Record<string, string> = {
  // Right
  LRN: BLUE,
  LLR: BLUE,
  LEXD: BLUE,
  LDVD: BLUE,
  LUD: BLUE,
  LUDR: BLUE,
  LUXD: BLUE,
  LUDI: BLUE,

  // Left
  LFI: RED,
  LSOC: RED,
  LCOM: RED,
  LEXG: RED,
  LDVG: RED,
  LUG: RED,
  LVEC: RED,
  LECO: RED,

  // Center
  LREN: ORANGE,
  LHOR: ORANGE,
  LMDM: ORANGE,
  LUC: ORANGE,
  LDVC: ORANGE,

  // Miscellaneous / Regional
  LDIV: TEAL,
  LREC: TEAL,
  LREG: TEAL,
  LDSV: TEAL,

  // No label
  "": GREY,
};

export const NUANCE_LABELS: Record<string, string> = {
  LRN: "Rassemblement National",
  LFI: "La France Insoumise",
  LSOC: "Parti Socialiste",
  LLR: "Les Républicains",
  LREN: "Renaissance",
  LECO: "Europe Écologie",
  LCOM: "Parti Communiste",
  LEXG: "Extrême Gauche",
  LEXD: "Extrême Droite",
  LDVG: "Divers Gauche",
  LDVD: "Divers Droite",
  LDIV: "Divers",
  LHOR: "Horizons",
  LMDM: "MoDem",
  LREC: "Régionaliste",
  LREG: "Régionaliste",
  LUC: "Union du Centre",
  LUD: "Union de la Droite",
  LUDI: "Union Divers",
  LUDR: "Union Droite Républicaine",
  LUG: "Union de la Gauche",
  LUXD: "Extrême Droite",
  LVEC: "Les Verts / Écologistes",
  LDSV: "Divers",
  LDVC: "Divers Centre",
  "": "Sans étiquette",
};

// Family label for the legend
export const FAMILY_LABELS: Record<string, string> = {
  [BLUE]: "Droite",
  [RED]: "Gauche",
  [ORANGE]: "Centre",
  [TEAL]: "Divers / Régional",
  [GREY]: "Sans étiquette",
};

export const NO_WINNER_COLOR = "#e5e7eb";

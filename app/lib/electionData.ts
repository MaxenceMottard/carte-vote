export interface Liste {
  numero: number;
  elu: boolean;
  nuance: string;
  voix: number;
  pct_voix_exprimes: number;
  nom?: string;
  prenom?: string;
}

export interface Participation {
  inscrits: number;
}

export interface CommuneResult {
  code_commune: string;
  listes: Liste[];
  participation: Participation;
}

export type WinnerMap = Map<string, string>;

export type CommuneResultsMap = Map<string, CommuneResult>;

export function buildResultsMap(results: CommuneResult[]): CommuneResultsMap {
  const map: CommuneResultsMap = new Map();
  for (const commune of results) {
    map.set(commune.code_commune, commune);
  }
  return map;
}

// French municipal T1 election rule:
// a list wins outright if it gets >50% of expressed votes AND >=25% of registered voters
export function isElectedT1(liste: Liste, inscrits: number): boolean {
  if (liste.pct_voix_exprimes <= 50) return false;
  const pctInscrits = inscrits > 0 ? (liste.voix / inscrits) * 100 : 0;
  return pctInscrits >= 25;
}

export function buildWinnerMap(results: CommuneResult[]): WinnerMap {
  const map: WinnerMap = new Map();
  for (const commune of results) {
    const inscrits = commune.participation?.inscrits ?? 0;
    // Prefer explicit elu flag, fall back to computed T1 rule
    const winner =
      commune.listes.find((l) => l.elu === true) ??
      commune.listes.find((l) => isElectedT1(l, inscrits));
    if (winner) {
      map.set(commune.code_commune, winner.nuance);
    }
  }
  return map;
}

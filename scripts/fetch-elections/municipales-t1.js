const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');

const URLS = {
  communes: 'https://static.data.gouv.fr/resources/elections-municipales-2026-resultats-du-premier-tour/20260318-182631/municipales-2026-resultats-communes-2026-03-18.csv',
  candidatures: 'https://static.data.gouv.fr/resources/elections-municipales-2026-listes-candidates-au-premier-tour/20260313-152615/municipales-2026-candidatures-france-entiere-tour-1-2026-03-13.csv',
};

function parseNum(str) {
  if (str == null || str === '') return null;
  const n = parseFloat(str.replace(',', '.').replace('%', ''));
  return isNaN(n) ? null : n;
}

function parseInt2(str) {
  if (str == null || str === '') return null;
  const n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}

function parseBool(str) {
  if (str == null || str.trim() === '') return false;
  return true;
}

function parseCSVLine(line, delimiter) {
  const result = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(field);
      field = '';
    } else {
      field += char;
    }
  }
  result.push(field);
  return result;
}

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchCSV(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      resolve(res);
    }).on('error', reject);
  });
}

async function parseCSV(url, transformFn, label) {
  const res = await fetchCSV(url);

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: res, crlfDelay: Infinity });
    let headers = null;
    let delimiter = ';';
    const results = [];
    let lineCount = 0;

    rl.on('line', (line) => {
      if (!line.trim()) return;

      if (!headers) {
        delimiter = line.includes(';') ? ';' : ',';
        headers = parseCSVLine(line, delimiter);
        return;
      }

      const values = parseCSVLine(line, delimiter);
      const row = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ''; });

      const transformed = transformFn(row);
      if (transformed) results.push(transformed);

      lineCount++;
      if (lineCount % 10000 === 0) {
        process.stdout.write(`\r  ${label}: ${lineCount} lignes...`);
      }
    });

    rl.on('close', () => {
      process.stdout.write(`\r  ${label}: ${lineCount} lignes traitées.\n`);
      resolve(results);
    });

    rl.on('error', reject);
  });
}

function transformCommune(row) {
  const listes = [];
  for (let i = 1; i <= 13; i++) {
    const panneau = row[`Numéro de panneau ${i}`];
    const libelle = row[`Libellé abrégé de liste ${i}`] || row[`Libellé de liste ${i}`];
    if (!panneau && !libelle) continue;

    listes.push({
      numero: parseInt2(panneau),
      libelle: libelle || '',
      nuance: row[`Nuance liste ${i}`] || '',
      voix: parseInt2(row[`Voix ${i}`]),
      pct_voix_exprimes: parseNum(row[`% Voix/exprimés ${i}`]),
      elu: parseBool(row[`Elu ${i}`]),
      sieges_cm: parseInt2(row[`Sièges au CM ${i}`]),
      sieges_cc: parseInt2(row[`Sièges au CC ${i}`]),
    });
  }

  return {
    code_commune: row['Code commune'],
    libelle: row['Libellé commune'],
    departement: {
      code: row['Code département'],
      libelle: row['Libellé département'],
    },
    participation: {
      inscrits: parseInt2(row['Inscrits']),
      votants: parseInt2(row['Votants']),
      pct_votants: parseNum(row['% Votants']),
      abstentions: parseInt2(row['Abstentions']),
      pct_abstentions: parseNum(row['% Abstentions']),
      exprimes: parseInt2(row['Exprimés']),
      blancs: parseInt2(row['Blancs']),
      pct_blancs_inscrits: parseNum(row['% Blancs/inscrits']),
      pct_blancs_votants: parseNum(row['% Blancs/votants']),
      nuls: parseInt2(row['Nuls']),
    },
    listes,
  };
}


function transformTeteListe(row) {
  // Filter by Ordre = 1 to avoid encoding issues with the accented "Tête de liste" column name
  if (row['Ordre'] !== '1') return null;

  return {
    code: row['Code circonscription'],
    panneau: parseInt2(row['Numéro de panneau']),
    nom: row['Nom sur le bulletin de vote'] || '',
    prenom: row['Prénom sur le bulletin de vote'] || '',
    sexe: row['Sexe'] || '',
  };
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  console.log('Téléchargement des résultats par communes...');
  const communes = await parseCSV(URLS.communes, transformCommune, 'communes');
  console.log(`→ ${communes.length} communes traitées`);
  const communesPath = path.join(DATA_DIR, '2026-municipales-t1-results.json');
  fs.writeFileSync(communesPath, JSON.stringify(communes));
  console.log(`  Écrit : ${communesPath}`);

  console.log('Téléchargement des têtes de liste...');
  const tetes = await parseCSV(URLS.candidatures, transformTeteListe, 'candidatures');
  console.log(`→ ${tetes.length} têtes de liste traitées`);
  const tetesPath = path.join(DATA_DIR, '2026-municipales-t1-tetes.json');
  fs.writeFileSync(tetesPath, JSON.stringify(tetes));
  console.log(`  Écrit : ${tetesPath}`);
}

main().catch((err) => {
  console.error('Erreur :', err.message);
  process.exit(1);
});

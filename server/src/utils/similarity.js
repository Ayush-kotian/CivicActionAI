const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your', 'yours'
]);

// Basic civic synonym map for semantic normalization
const CIVIC_SYNONYMS = {
  potholes: 'pothole',
  crater: 'pothole',
  craters: 'pothole',
  depressions: 'pothole',
  flooded: 'waterlog',
  flooding: 'waterlog',
  waterlogged: 'waterlog',
  waterlogging: 'waterlog',
  water: 'waterlog',
  stagnant: 'waterlog',
  trash: 'garbage',
  waste: 'garbage',
  refuse: 'garbage',
  debris: 'garbage',
  bins: 'garbage',
  bin: 'garbage',
  lights: 'streetlight',
  lamp: 'streetlight',
  luminaire: 'streetlight',
  drains: 'drainage',
  drain: 'drainage',
  gutter: 'drainage',
  gutters: 'drainage',
  sewer: 'drainage',
  sewage: 'drainage',
  pipe: 'water_supply',
  pipeline: 'water_supply',
  bikes: 'motorcycle',
  scooters: 'motorcycle',
  motorcycles: 'motorcycle',
  'two-wheelers': 'motorcycle',
  gate: 'entrance',
  entry: 'entrance',
  stops: 'bus_stop',
  stand: 'bus_stop'
};

export function normalizeWord(word) {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  return CIVIC_SYNONYMS[clean] || clean;
}

export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token))
    .map(normalizeWord);
}

export function getNgrams(tokens, n = 2) {
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

export function calculateJaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/**
 * Hybrid text similarity combining normalized tokens and shared civic terms
 */
export function calculateTextSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (!tokensA.length || !tokensB.length) return 0;

  const wordSim = calculateJaccardSimilarity(tokensA, tokensB);

  const ngramsA = getNgrams(tokensA, 2);
  const ngramsB = getNgrams(tokensB, 2);
  const ngramSim = (ngramsA.length && ngramsB.length)
    ? calculateJaccardSimilarity(ngramsA, ngramsB)
    : 0;

  // Keyword overlap count
  const setA = new Set(tokensA);
  let sharedKeywords = 0;
  for (const t of tokensB) {
    if (setA.has(t)) sharedKeywords++;
  }
  const keywordBoost = Math.min(0.4, sharedKeywords * 0.1);

  return Math.min(1.0, (wordSim * 0.5) + (ngramSim * 0.2) + keywordBoost);
}

/**
 * Boilerplate Measurement Script (§7.6)
 * Usage: node scripts/measure_boilerplate.js <base_url>
 * Measures word-based and sentence-based boilerplate across 10 diverse check pages.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUrl = (process.argv[2] || 'http://127.0.0.1:8788').replace(/\/+$/, '');

// Select 10 diverse real check URLs from drip_manifest.json (10 distinct products across brands & rules)
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/drip_manifest.json'), 'utf8'));
const checks = manifest.filter(e => e.type === 'check' && e.drip_day <= 3);
const SAMPLE_SLUGS = [];
const seenProducts = new Set();
const seenBrands = new Set();
const seenRules = new Set();
for (const c of checks) {
  if (!seenProducts.has(c.product) && !seenBrands.has(c.brand) && !seenRules.has(c.rule)) {
    SAMPLE_SLUGS.push(c.url);
    seenProducts.add(c.product);
    seenBrands.add(c.brand);
    seenRules.add(c.rule);
    if (SAMPLE_SLUGS.length >= 10) break;
  }
}
for (const c of checks) {
  if (SAMPLE_SLUGS.length >= 10) break;
  if (!seenProducts.has(c.product)) {
    SAMPLE_SLUGS.push(c.url);
    seenProducts.add(c.product);
  }
}

const BRAND_HUB_SLUGS = ['/brand/cerave', '/brand/kiehl-s-since-1851'];
const ALL_TARGETS = [...SAMPLE_SLUGS, ...BRAND_HUB_SLUGS];

function extractVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length >= 15);
}

function getWordNgrams(words, n = 6) {
  const grams = [];
  for (let i = 0; i <= words.length - n; i++) {
    grams.push(words.slice(i, i + n).join(' '));
  }
  return grams;
}

const pages = [];
for (const slug of ALL_TARGETS) {
  const url = `${baseUrl}${slug}`;
  const res = await fetch(url);
  if (res.status !== 200) {
    console.error(`❌ ${url} returned HTTP ${res.status}`);
    process.exit(1);
  }
  const html = await res.text();
  const text = extractVisibleText(html);
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const sentences = getSentences(text);
  const grams = new Set(getWordNgrams(words, 6));
  pages.push({ slug, words, sentences, grams });
}

const threshold = Math.ceil(pages.length * 0.8); // >=80% = 8 of 10 pages

const sentenceDocFreq = new Map();
const gramDocFreq = new Map();

for (const p of pages) {
  for (const s of new Set(p.sentences)) {
    sentenceDocFreq.set(s, (sentenceDocFreq.get(s) || 0) + 1);
  }
  for (const g of p.grams) {
    gramDocFreq.set(g, (gramDocFreq.get(g) || 0) + 1);
  }
}

const sharedSentences = new Set([...sentenceDocFreq.entries()].filter(([, c]) => c >= threshold).map(([s]) => s));
const sharedGrams = new Set([...gramDocFreq.entries()].filter(([, c]) => c >= threshold).map(([g]) => g));

console.log(`📏 Boilerplate Measurement across ${pages.length} live check pages at ${baseUrl} (threshold >= ${threshold} pages):\n`);

let anyOver30 = false;
let sumWordPct = 0;
let sumSentPct = 0;

for (const p of pages) {
  // Word-based: mark words belonging to any shared 6-gram
  const boilerplateWordFlags = new Array(p.words.length).fill(false);
  for (let i = 0; i <= p.words.length - 6; i++) {
    const gram = p.words.slice(i, i + 6).join(' ');
    if (sharedGrams.has(gram)) {
      for (let k = 0; k < 6; k++) boilerplateWordFlags[i + k] = true;
    }
  }
  const sharedWordCount = boilerplateWordFlags.filter(Boolean).length;
  const wordPct = (sharedWordCount / p.words.length) * 100;

  const sharedSentCount = p.sentences.filter(s => sharedSentences.has(s)).length;
  const sentPct = p.sentences.length ? (sharedSentCount / p.sentences.length) * 100 : 0;

  sumWordPct += wordPct;
  sumSentPct += sentPct;
  if (wordPct > 30 || sentPct > 30) anyOver30 = true;

  console.log(`- ${p.slug}`);
  console.log(`  Words: ${p.words.length} | Word-based boilerplate: ${wordPct.toFixed(1)}% | Sentence-based boilerplate: ${sentPct.toFixed(1)}%`);
}

console.log(`\nAverage Word-based: ${(sumWordPct / pages.length).toFixed(1)}% | Average Sentence-based: ${(sumSentPct / pages.length).toFixed(1)}%`);
if (anyOver30) {
  console.error('❌ One or more pages exceeded 30% word-based or sentence-based boilerplate!');
  process.exit(1);
}
console.log('✅ All 12 pages (10 check + 2 brand hubs) <= 30% word-based AND sentence-based boilerplate!');

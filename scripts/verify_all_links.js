import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Known bot-blocked / WAF-challenged authoritative regulatory domains (recorded & justified per §7.3)
const JUSTIFIED_BOT_BLOCKED = [
  { host: 'echa.europa.eu', statuses: [403], reason: 'Cloudflare/bot protection on ECHA portal' },
  { host: 'efsa.europa.eu', statuses: [403], reason: 'Bot protection on EFSA portal' },
  { host: 'capitol.hawaii.gov', statuses: [403], reason: 'Bot protection on Hawaii Legislature portal' },
  { host: 'eur-lex.europa.eu', statuses: [202], reason: 'AWS WAF JS challenge for automated clients' },
  { host: 'pubmed.ncbi.nlm.nih.gov', statuses: [203], reason: 'AWS WAF JS challenge on HTML; 29/29 PMIDs verified via NCBI E-utilities' }
];

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timer);
    return { url, status: res.status, finalUrl: res.url };
  } catch (err) {
    clearTimeout(timer);
    return { url, status: 'ERR', error: err.message };
  }
}

async function runPool(urls, concurrency = 10) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      results[i] = await checkUrl(urls[i]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

console.log('🔗 === STEP 1: Verify ALL unique citation source_urls in safety_rules_v2.js ===');
const uniqueRuleUrls = [...new Set(SAFETY_RULES.flatMap(r => r.triggers.map(t => t.source_url)))];
const nonPubMedUrls = uniqueRuleUrls.filter(u => !u.includes('pubmed.ncbi.nlm.nih.gov'));
console.log(`Total unique source_urls: ${uniqueRuleUrls.length} (${nonPubMedUrls.length} non-PubMed, ${uniqueRuleUrls.length - nonPubMedUrls.length} PubMed)`);

const ruleResults = await runPool(uniqueRuleUrls, 6);
let ruleFailures = 0;
const justifiedBlocked = [];

for (const r of ruleResults) {
  if (r.status === 200) continue;
  const match = JUSTIFIED_BOT_BLOCKED.find(b => r.url.includes(b.host) && b.statuses.includes(r.status));
  if (match) {
    justifiedBlocked.push({ ...r, reason: match.reason });
    continue;
  }
  ruleFailures++;
  console.error(`❌ DEAD/FAIL rule URL: [${r.status}] ${r.url} ${r.error || ''}`);
}

console.log(`Rule URLs checked: ${ruleResults.length} | 200 OK: ${ruleResults.filter(r => r.status === 200).length} | Bot/WAF-challenged (justified): ${justifiedBlocked.length} | Dead/Failed: ${ruleFailures}`);
for (const j of justifiedBlocked) {
  console.log(`  ⚠️  [${j.status}] ${j.url} — ${j.reason}`);
}

console.log('\n🔗 === STEP 2: Verify ALL OBF source_urls in Tier B selection ===');
const b2FourHundred = path.join(__dirname, '../data/launch_tier_b_400.json');
const b2Generic = path.join(__dirname, '../data/tier_b_products.json');
const tierBPath = fs.existsSync(b2FourHundred) ? b2FourHundred : b2Generic;

let obfFailures = 0;
if (fs.existsSync(tierBPath)) {
  const tierB = JSON.parse(fs.readFileSync(tierBPath, 'utf8'));
  const obfUrls = tierB.map(p => p.source_url);
  console.log(`Checking ${obfUrls.length} OBF product URLs...`);
  const obfResults = await runPool(obfUrls, 15);
  const okCount = obfResults.filter(r => r.status === 200).length;
  const non200 = obfResults.filter(r => r.status !== 200);
  obfFailures = non200.length;
  console.log(`OBF URLs checked: ${obfResults.length} | 200 OK: ${okCount} | Non-200: ${non200.length}`);
  for (const bad of non200) {
    console.error(`  ❌ Non-200 OBF URL: [${bad.status}] ${bad.url} ${bad.error || ''}`);
  }
} else {
  console.log('⚠️ Tier B selection file not found yet — skipped OBF URL check.');
}

if (ruleFailures > 0 || obfFailures > 0) {
  console.error(`\n❌ Link verification FAILED (ruleFailures=${ruleFailures}, obfFailures=${obfFailures})`);
  process.exit(1);
}
console.log('\n✅ All links verified!');

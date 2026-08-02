import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../beauty_pseo.db');

const db = new Database(dbPath, { readonly: true });

const testSlug = 'is-cerave-hydrating-facial-cleanser-fungal-acne-safe';

console.log(`⏱️ Benchmarking indexed lookup for slug: "${testSlug}"...`);

const start = performance.now();
const result = db.prepare(`
  SELECT pm.slug, pm.status, pm.conflict_list, pm.safety_score,
         p.brand, p.name as product_name, p.category, p.ingredients_raw,
         r.name as rule_name, r.description as rule_description
  FROM page_matrix pm
  JOIN products p ON pm.product_id = p.id
  JOIN safety_rules r ON pm.rule_id = r.id
  WHERE pm.slug = ?
`).get(testSlug);
const duration = performance.now() - start;

console.log('✅ Lookup Result:');
console.log(result);
console.log(`🚀 Query Execution Time: ${duration.toFixed(3)} ms!`);

db.close();

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

let localDb = null;

function getLocalDb() {
  if (!localDb) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbPath = path.resolve(__dirname, '../../beauty_pseo.db');
    localDb = new Database(dbPath, { readonly: true });
  }
  return localDb;
}

export async function getPageData(slug, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.status, pm.conflict_list, pm.safety_score,
               p.id as product_id, p.brand, p.name as product_name, p.category, p.ingredients_raw, p.ingredients_list,
               r.id as rule_id, r.name as rule_name, r.slug as rule_slug, r.description as rule_description
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE pm.slug = ?
      `).bind(slug).first();
      return res;
    } catch (e) {
      console.warn('Cloudflare D1 query fallback to local DB:', e);
    }
  }

  const db = getLocalDb();
  const row = db.prepare(`
    SELECT pm.slug, pm.status, pm.conflict_list, pm.safety_score,
           p.id as product_id, p.brand, p.name as product_name, p.category, p.ingredients_raw, p.ingredients_list,
           r.id as rule_id, r.name as rule_name, r.slug as rule_slug, r.description as rule_description
    FROM page_matrix pm
    JOIN products p ON pm.product_id = p.id
    JOIN safety_rules r ON pm.rule_id = r.id
    WHERE pm.slug = ?
  `).get(slug);

  return row || null;
}

export async function getSafeAlternative(ruleId, category, currentProductId, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.safety_score, p.brand, p.name as product_name, p.category
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        WHERE pm.rule_id = ? AND pm.status = 'PASS' AND p.id != ?
        ORDER BY pm.safety_score DESC
        LIMIT 1
      `).bind(ruleId, currentProductId).first();
      return res;
    } catch (e) {}
  }

  const db = getLocalDb();
  return db.prepare(`
    SELECT pm.slug, pm.safety_score, p.brand, p.name as product_name, p.category
    FROM page_matrix pm
    JOIN products p ON pm.product_id = p.id
    WHERE pm.rule_id = ? AND pm.status = 'PASS' AND p.id != ?
    ORDER BY pm.safety_score DESC
    LIMIT 1
  `).get(ruleId, currentProductId);
}

export async function getRelatedChecks(productId, currentRuleId, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, r.name as rule_name, r.slug as rule_slug
        FROM page_matrix pm
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE pm.product_id = ? AND pm.rule_id != ?
        LIMIT 6
      `).bind(productId, currentRuleId).all();
      return res.results || [];
    } catch (e) {}
  }

  const db = getLocalDb();
  return db.prepare(`
    SELECT pm.slug, pm.status, pm.safety_score, r.name as rule_name, r.slug as rule_slug
    FROM page_matrix pm
    JOIN safety_rules r ON pm.rule_id = r.id
    WHERE pm.product_id = ? AND pm.rule_id != ?
    LIMIT 6
  `).all(productId, currentRuleId);
}

export async function searchProducts(query, runtimeEnv) {
  if (!query || query.length < 2) return [];
  const searchTerm = `%${query}%`;

  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT DISTINCT brand, name, category
        FROM products
        WHERE brand LIKE ? OR name LIKE ?
        LIMIT 10
      `).bind(searchTerm, searchTerm).all();
      return res.results || [];
    } catch (e) {}
  }

  const db = getLocalDb();
  return db.prepare(`
    SELECT DISTINCT brand, name, category
    FROM products
    WHERE brand LIKE ? OR name LIKE ?
    LIMIT 10
  `).all(searchTerm, searchTerm);
}

export async function getPopularChecks(limit = 12, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, p.brand, p.name as product_name, r.name as rule_name
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        LIMIT ?
      `).bind(limit).all();
      return res.results || [];
    } catch (e) {}
  }

  const db = getLocalDb();
  return db.prepare(`
    SELECT pm.slug, pm.status, pm.safety_score, p.brand, p.name as product_name, r.name as rule_name
    FROM page_matrix pm
    JOIN products p ON pm.product_id = p.id
    JOIN safety_rules r ON pm.rule_id = r.id
    LIMIT ?
  `).all(limit);
}

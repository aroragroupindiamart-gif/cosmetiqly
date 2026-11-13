import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { SAFETY_RULES } from './safety_rules_v2.js';
import { evaluateProductRule, isRuleRelevant } from './rule_engine_v2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/cosmetiqly_real.db');

let _db = null;
function getDb() {
  if (!_db) {
    _db = new Database(dbPath, { readonly: true });
  }
  return _db;
}

/**
 * Searches real products by keyword query
 */
export async function searchProducts(query, limit = 10, env = null) {
  if (!query || query.trim().length < 2) return [];
  const db = getDb();
  const q = `%${query.trim().toLowerCase()}%`;
  return db.prepare(`
    SELECT barcode, brand, name, product_slug, brand_slug, category, ingredient_count
    FROM products
    WHERE LOWER(brand) LIKE ? OR LOWER(name) LIKE ?
    LIMIT ?
  `).all(q, q, limit);
}

/**
 * Retrieves a real product by brand slug and product slug
 */
export async function getProductBySlugs(brandSlug, productSlug, env = null) {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM products
    WHERE brand_slug = ? AND product_slug = ?
    LIMIT 1
  `).get(brandSlug, productSlug);

  if (!row) return null;
  return {
    ...row,
    ingredients_list: JSON.parse(row.ingredients_list)
  };
}

/**
 * Retrieves a check page by compound slug:
 * e.g. "is-cerave-foaming-facial-cleanser-fungal-acne-safe"
 */
export async function getCheckPageData(slug, env = null) {
  if (!slug || !slug.startsWith('is-')) return null;

  // Find matching rule from 15 rules
  let matchedRule = null;
  for (const rule of SAFETY_RULES) {
    const suffix = `-${rule.slug}-safe`;
    if (slug.endsWith(suffix)) {
      matchedRule = rule;
      break;
    }
  }
  if (!matchedRule) return null;

  // Extract core product identifier: is-[brand-product]-rule-safe
  const core = slug.slice(3, -(matchedRule.slug.length + 6)); // strip 'is-' and '-{rule}-safe'
  if (!core) return null;

  const db = getDb();

  // Try matching against real products where core starts with brand_slug
  const candidates = db.prepare(`
    SELECT * FROM products 
    WHERE ? LIKE (brand_slug || '-%')
  `).all(core);

  let matchedProduct = null;
  for (const cand of candidates) {
    if (core === `${cand.brand_slug}-${cand.product_slug}`) {
      matchedProduct = cand;
      break;
    }
  }

  if (!matchedProduct) return null;

  const parsedIngredients = JSON.parse(matchedProduct.ingredients_list);

  // Check category relevance
  const isRelevant = isRuleRelevant(matchedRule, matchedProduct.category);
  if (!isRelevant) {
    // If not relevant (e.g. reef-safe on a lipstick), this page does not exist (§3)
    return null;
  }

  // Pure dynamic evaluation using Rule Engine v2
  const evaluation = evaluateProductRule(parsedIngredients, matchedRule);

  return {
    product: {
      ...matchedProduct,
      ingredients_list: parsedIngredients
    },
    rule: matchedRule,
    evaluation
  };
}

/**
 * Retrieves evaluated alternatives for the same rule & category that PASS with no flags
 */
export async function getEvaluatedAlternatives(currentBarcode, rule, category, limit = 3, env = null) {
  const db = getDb();
  const candidates = db.prepare(`
    SELECT * FROM products
    WHERE barcode != ? AND category = ?
    LIMIT 20
  `).all(currentBarcode, category);

  const cleanAlts = [];
  for (const cand of candidates) {
    const ings = JSON.parse(cand.ingredients_list);
    const evalRes = evaluateProductRule(ings, rule);
    if (evalRes.verdictStatus === 'PASS' && evalRes.score >= 9.5) {
      cleanAlts.push({
        ...cand,
        ingredients_list: ings,
        evaluation: evalRes
      });
      if (cleanAlts.length >= limit) break;
    }
  }
  return cleanAlts;
}

/**
 * Retrieves other evaluated checks for this same product across relevant rules
 */
export async function getOtherProductChecks(product, currentRuleSlug, env = null) {
  const otherChecks = [];
  for (const rule of SAFETY_RULES) {
    if (rule.slug === currentRuleSlug) continue;
    if (!isRuleRelevant(rule, product.category)) continue;

    const evalRes = evaluateProductRule(product.ingredients_list, rule);
    otherChecks.push({
      rule,
      evaluation: evalRes,
      slug: `is-${product.brand_slug}-${product.product_slug}-${rule.slug}-safe`
    });
  }
  return otherChecks;
}

/**
 * Gets verified brand products
 */
export async function getBrandProducts(brandSlug, env = null) {
  const db = getDb();
  return db.prepare(`
    SELECT barcode, brand, brand_slug, name, product_slug, category, ingredient_count
    FROM products
    WHERE brand_slug = ?
    ORDER BY name ASC
  `).all(brandSlug);
}

/**
 * Gets unique brands starting with letter
 */
export async function getBrandsByLetter(letter, env = null) {
  const db = getDb();
  const l = `${letter.toLowerCase()}%`;
  return db.prepare(`
    SELECT DISTINCT brand, brand_slug, COUNT(*) as product_count
    FROM products
    WHERE LOWER(brand) LIKE ?
    GROUP BY brand, brand_slug
    ORDER BY brand ASC
  `).all(l);
}

/**
 * Gets top brands by product volume
 */
export async function getTopBrands(limit = 48, env = null) {
  const db = getDb();
  return db.prepare(`
    SELECT brand, brand_slug, COUNT(*) as product_count
    FROM products
    GROUP BY brand, brand_slug
    ORDER BY product_count DESC
    LIMIT ?
  `).all(limit);
}

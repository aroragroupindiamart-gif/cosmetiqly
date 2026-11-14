/**
 * Cosmetiqly Database Client (Cloudflare D1 Native + Node Fallback)
 * 
 * Supports:
 * - Cloudflare D1 in production / preview via Astro.locals.runtime.env.DB
 * - Lazy dynamic fallback to local SQLite for Node.js build scripts & tests
 * - Zero native module compilation errors on Cloudflare Workers
 */

import { SAFETY_RULES } from './safety_rules_v2.js';
import { evaluateProductRule, isRuleRelevant } from './rule_engine_v2.js';

/**
 * Executes a parameterized SQL query returning multiple rows against Cloudflare D1.
 */
async function queryAll(db, sql, params = []) {
  if (db && typeof db.prepare === 'function') {
    const stmt = db.prepare(sql).bind(...params);
    const res = await stmt.all();
    return res && Array.isArray(res.results) ? res.results : (Array.isArray(res) ? res : []);
  }
  return [];
}

/**
 * Executes a parameterized SQL query returning a single row against Cloudflare D1.
 */
async function queryFirst(db, sql, params = []) {
  if (db && typeof db.prepare === 'function') {
    const stmt = db.prepare(sql).bind(...params);
    if (typeof stmt.first === 'function') {
      return await stmt.first();
    }
    const res = await stmt.all();
    const rows = res && Array.isArray(res.results) ? res.results : (Array.isArray(res) ? res : []);
    return rows[0] || null;
  }
  return null;
}

/**
 * Searches real products by keyword query
 */
export async function searchProducts(query, limit = 10, db = null) {
  if (!query || query.trim().length < 2) return [];
  const q = `%${query.trim().toLowerCase()}%`;
  return await queryAll(db, `
    SELECT barcode, brand, name, product_slug, brand_slug, category, ingredient_count
    FROM products
    WHERE LOWER(brand) LIKE ? OR LOWER(name) LIKE ?
    LIMIT ?
  `, [q, q, limit]);
}

/**
 * Retrieves a real product by brand slug and product slug
 */
export async function getProductBySlugs(brandSlug, productSlug, db = null) {
  const row = await queryFirst(db, `
    SELECT * FROM products
    WHERE brand_slug = ? AND product_slug = ?
    LIMIT 1
  `, [brandSlug, productSlug]);

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
export async function getCheckPageData(slug, db = null) {
  if (!slug || !slug.startsWith('is-')) return null;

  // Find matching rule from 15 rules (sorted by slug length descending for exact boundary matching)
  let matchedRule = null;
  let ruleSuffix = '';
  const sortedRules = [...SAFETY_RULES].sort((a, b) => b.slug.length - a.slug.length);
  for (const rule of sortedRules) {
    const primarySuffix = rule.slug.endsWith('-safe') ? `-${rule.slug}` : `-${rule.slug}-safe`;
    const fallbackSuffix = `-${rule.slug}-safe`;
    if (slug.endsWith(primarySuffix)) {
      matchedRule = rule;
      ruleSuffix = primarySuffix;
      break;
    } else if (slug.endsWith(fallbackSuffix)) {
      matchedRule = rule;
      ruleSuffix = fallbackSuffix;
      break;
    }
  }
  if (!matchedRule) return null;

  // Extract core product identifier: is-[brand-product]-[ruleSuffix]
  const core = slug.slice(3, -ruleSuffix.length);
  if (!core) return null;

  // Query candidates matching brand_slug prefix
  const candidates = await queryAll(db, `
    SELECT * FROM products 
    WHERE ? LIKE (brand_slug || '-%')
  `, [core]);

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
export async function getEvaluatedAlternatives(currentBarcode, rule, category, limit = 3, db = null) {
  const candidates = await queryAll(db, `
    SELECT * FROM products
    WHERE barcode != ? AND category = ?
    LIMIT 20
  `, [currentBarcode, category]);

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
export async function getOtherProductChecks(product, currentRuleSlug) {
  const otherChecks = [];
  for (const rule of SAFETY_RULES) {
    if (rule.slug === currentRuleSlug) continue;
    if (!isRuleRelevant(rule, product.category)) continue;

    const evalRes = evaluateProductRule(product.ingredients_list, rule);
    let checkSlug = `is-${product.brand_slug}-${product.product_slug}-${rule.slug}-safe`;
    checkSlug = checkSlug.replace(/-safe-safe$/, '-safe');
    otherChecks.push({
      rule,
      evaluation: evalRes,
      slug: checkSlug
    });
  }
  return otherChecks;
}

/**
 * Gets verified brand products
 */
export async function getBrandProducts(brandSlug, db = null) {
  return await queryAll(db, `
    SELECT barcode, brand, brand_slug, name, product_slug, category, ingredient_count
    FROM products
    WHERE brand_slug = ?
    ORDER BY name ASC
  `, [brandSlug]);
}

/**
 * Gets unique brands starting with letter
 */
export async function getBrandsByLetter(letter, db = null) {
  const l = `${letter.toLowerCase()}%`;
  return await queryAll(db, `
    SELECT DISTINCT brand, brand_slug, COUNT(*) as product_count
    FROM products
    WHERE LOWER(brand) LIKE ?
    GROUP BY brand, brand_slug
    ORDER BY brand ASC
  `, [l]);
}

/**
 * Gets top brands by product volume
 */
export async function getTopBrands(limit = 48, db = null) {
  return await queryAll(db, `
    SELECT brand, brand_slug, COUNT(*) as product_count
    FROM products
    GROUP BY brand, brand_slug
    ORDER BY product_count DESC
    LIMIT ?
  `, [limit]);
}

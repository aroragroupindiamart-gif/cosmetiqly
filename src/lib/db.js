let localDb = null;

async function getLocalDb() {
  if (localDb) return localDb;
  try {
    const { default: Database } = await import('better-sqlite3');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dbPath = path.resolve(__dirname, '../../beauty_pseo.db');
    localDb = new Database(dbPath, { readonly: true });
    return localDb;
  } catch (err) {
    console.warn('better-sqlite3 not available in edge environment:', err.message);
    return null;
  }
}

export async function getPageData(slug, runtimeEnv) {
  // 1. Check Cloudflare D1 Database binding
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
      if (res) return res;
    } catch (e) {
      console.warn('Cloudflare D1 query error:', e);
    }
  }

  // 2. Fallback to local SQLite for local dev
  const db = await getLocalDb();
  if (db) {
    try {
      const row = db.prepare(`
        SELECT pm.slug, pm.status, pm.conflict_list, pm.safety_score,
               p.id as product_id, p.brand, p.name as product_name, p.category, p.ingredients_raw, p.ingredients_list,
               r.id as rule_id, r.name as rule_name, r.slug as rule_slug, r.description as rule_description
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE pm.slug = ?
      `).get(slug);
      if (row) return row;
    } catch (e) {}
  }

  return null;
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
      if (res) return res;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT pm.slug, pm.safety_score, p.brand, p.name as product_name, p.category
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        WHERE pm.rule_id = ? AND pm.status = 'PASS' AND p.id != ?
        ORDER BY pm.safety_score DESC
        LIMIT 1
      `).get(ruleId, currentProductId);
    } catch (e) {}
  }

  return null;
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
      if (res && res.results) return res.results;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, r.name as rule_name, r.slug as rule_slug
        FROM page_matrix pm
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE pm.product_id = ? AND pm.rule_id != ?
        LIMIT 6
      `).all(productId, currentRuleId);
    } catch (e) {}
  }

  return [];
}

export async function getBrandChecks(brand, currentProductId, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, p.name as product_name, r.name as rule_name
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE p.brand = ? AND p.id != ? AND pm.rule_id = 1
        LIMIT 4
      `).bind(brand, currentProductId).all();
      if (res && res.results) return res.results;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, p.name as product_name, r.name as rule_name
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        WHERE p.brand = ? AND p.id != ? AND pm.rule_id = 1
        LIMIT 4
      `).all(brand, currentProductId);
    } catch (e) {}
  }

  return [];
}

export async function getTopBrands(limit = 40, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT brand, COUNT(id) as product_count
        FROM products
        GROUP BY brand
        ORDER BY product_count DESC
        LIMIT ?
      `).bind(limit).all();
      if (res && res.results) return res.results;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT brand, COUNT(id) as product_count
        FROM products
        GROUP BY brand
        ORDER BY product_count DESC
        LIMIT ?
      `).all(limit);
    } catch (e) {}
  }

  return [];
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
      if (res && res.results) return res.results;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT DISTINCT brand, name, category
        FROM products
        WHERE brand LIKE ? OR name LIKE ?
        LIMIT 10
      `).all(searchTerm, searchTerm);
    } catch (e) {}
  }

  return [];
}

export async function getPopularChecks(limit = 24, runtimeEnv) {
  if (runtimeEnv && runtimeEnv.DB) {
    try {
      const res = await runtimeEnv.DB.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, p.brand, p.name as product_name, r.name as rule_name
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        LIMIT ?
      `).bind(limit).all();
      if (res && res.results) return res.results;
    } catch (e) {}
  }

  const db = await getLocalDb();
  if (db) {
    try {
      return db.prepare(`
        SELECT pm.slug, pm.status, pm.safety_score, p.brand, p.name as product_name, r.name as rule_name
        FROM page_matrix pm
        JOIN products p ON pm.product_id = p.id
        JOIN safety_rules r ON pm.rule_id = r.id
        LIMIT ?
      `).all(limit);
    } catch (e) {}
  }

  return [];
}

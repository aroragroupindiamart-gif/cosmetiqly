import dripManifest from '../../data/drip_manifest.json';
import prunedUrls from '../../data/pruned_urls.json';
import { SAFETY_RULES } from './safety_rules_v2.js';
import { isRuleRelevant } from './rule_engine_v2.js';

const urlDripDayMap = new Map();
for (const entry of dripManifest) {
  urlDripDayMap.set(entry.url, entry.drip_day);
}

const prunedSet = new Set(Array.isArray(prunedUrls) ? prunedUrls : []);

export function getDripDayMap() {
  return urlDripDayMap;
}

export function getPrunedUrlSet() {
  return prunedSet;
}

/**
 * Calculates current drip day dynamically based on LAUNCH_DATE env var.
 * If LAUNCH_DATE is unset or in the future, defaults to Day 1.
 */
export function getCurrentDripDay(runtimeEnv) {
  const launchDateStr = runtimeEnv?.LAUNCH_DATE ||
    (typeof import.meta !== 'undefined' && import.meta.env?.LAUNCH_DATE) ||
    (typeof process !== 'undefined' ? process.env?.LAUNCH_DATE : undefined);

  if (!launchDateStr) return 1;
  const launchTime = new Date(launchDateStr).getTime();
  if (isNaN(launchTime)) return 1;

  const now = Date.now();
  if (now < launchTime) return 1;

  const daysElapsed = Math.floor((now - launchTime) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, daysElapsed);
}

/**
 * Returns true iff the URL is in the manifest, NOT pruned, and its drip_day <= currentDay.
 */
export function isUrlDripped(urlPath, currentDay) {
  if (!urlPath) return false;
  if (prunedSet.has(urlPath)) return false;
  const dripDay = urlDripDayMap.get(urlPath);
  if (dripDay === undefined) return false;
  return dripDay <= currentDay;
}

/**
 * Single canonical check slug builder (with -safe-safe dedupe).
 */
export function buildCheckSlug(brandSlug, productSlug, ruleSlug) {
  let slug = `is-${brandSlug}-${productSlug}-${ruleSlug}-safe`;
  return slug.replace(/-safe-safe$/, '-safe');
}

/**
 * Returns the first relevant, dripped /check/... URL for a product, or null if none is dripped.
 */
export function getFirstRelevantCheckUrl(product, currentDay) {
  if (!product) return null;
  for (const rule of SAFETY_RULES) {
    if (isRuleRelevant(rule, product.category)) {
      const slug = buildCheckSlug(product.brand_slug, product.product_slug, rule.slug);
      const urlPath = `/check/${slug}`;
      if (isUrlDripped(urlPath, currentDay)) {
        return urlPath;
      }
    }
  }
  return null;
}

/**
 * Shared OBF image URL validator (§3.1 / §3.4).
 */
export function isValidObfImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const u = url.trim();
  if (!u.startsWith('https://images.openbeautyfacts.org/') && !u.startsWith('http://images.openbeautyfacts.org/')) {
    return false;
  }
  if (u.includes('/invalid/')) return false;
  return true;
}

import { SAFETY_RULES } from './safety_rules_v2.js';

/**
 * Normalizes an INCI ingredient token for EXACT matching:
 * - lowercase
 * - remove content in parentheses (e.g., 'water (aqua/eau)' -> 'water')
 * - remove percentages, asterisks, organic markers
 * - collapse whitespace
 */
export function normalizeToken(token) {
  if (!token) return '';
  return token
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[*†‡]/g, '')
    .replace(/\b\d+(\.\d+)?%\b/g, '')
    .replace(/[\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a rule is relevant for a given product category
 */
export function isRuleRelevant(rule, productCategory) {
  if (!rule || !rule.relevantCategories || rule.relevantCategories.length === 0) {
    return true;
  }
  if (!productCategory) return true;
  const cat = productCategory.toLowerCase().trim();
  return rule.relevantCategories.some(rc => {
    const rcl = rc.toLowerCase().trim();
    return cat.includes(rcl) || rcl.includes(cat);
  });
}

/**
 * Core Rule Engine v2 Evaluation:
 * Evaluates a product's ingredient list against a specific safety rule.
 * 
 * Rules:
 * - EXACT token matching on normalized INCI names
 * - NO substring matching
 * - Severity tagging per flagged item (HIGH vs MODERATE) with citation
 * - Score = max(1, 10 - 3*H - 1.5*M)
 * - Tiers: 10 = Green "No concerns flagged", 7.0-8.5 = Amber "Review the flags", 1.0-5.5 = Red "High concern"
 * - Binary verdict:
 *   - 'free' rules fail on ANY flagged ingredient
 *   - 'risk' rules fail on ANY high-risk trigger, pass-with-caution on moderate-only
 */
export function evaluateProductRule(ingredientsList, rule) {
  if (!rule) {
    throw new Error('Rule is required for evaluation');
  }

  const rawList = Array.isArray(ingredientsList) ? ingredientsList : [];
  const normalizedIngredients = rawList.map(ing => ({
    original: ing,
    normalized: normalizeToken(ing)
  }));

  const flagged = [];
  let highRiskCount = 0;
  let moderateRiskCount = 0;

  for (const trigger of rule.triggers) {
    const normTrigger = normalizeToken(trigger.name);

    for (const ing of normalizedIngredients) {
      // EXACT token comparison: no substring matching
      if (ing.normalized === normTrigger) {
        flagged.push({
          ingredient: ing.original,
          matchedTrigger: trigger.name,
          severity: trigger.severity,
          citation: trigger.citation,
          note: trigger.note
        });

        if (trigger.severity === 'HIGH') {
          highRiskCount++;
        } else {
          moderateRiskCount++;
        }
        break; // Once matched, don't duplicate flag for the same trigger
      }
    }
  }

  // Calculate score using owner-approved formula
  const rawScore = 10 - (3 * highRiskCount) - (1.5 * moderateRiskCount);
  const score = Math.max(1, Math.round(rawScore * 10) / 10);

  // Score tier
  let tier = 'high';
  let tierLabel = 'High concern';
  if (score >= 9.5) {
    tier = 'clean';
    tierLabel = 'No concerns flagged';
  } else if (score >= 7.0) {
    tier = 'amber';
    tierLabel = 'Review the flags';
  }

  // Binary verdict logic per brief:
  // "free" rules fail on ANY flagged ingredient
  // "risk" rules fail on ANY high-risk trigger, pass-with-caution on moderate-only
  let verdictStatus = 'PASS';
  let verdictText = 'Pass';

  if (rule.type === 'free') {
    if (flagged.length > 0) {
      verdictStatus = 'FAIL';
      verdictText = 'Fails standards';
    } else {
      verdictStatus = 'PASS';
      verdictText = 'Free of flagged ingredients';
    }
  } else {
    // type === 'risk'
    if (highRiskCount > 0) {
      verdictStatus = 'FAIL';
      verdictText = 'Fails safety standards';
    } else if (moderateRiskCount > 0) {
      verdictStatus = 'CAUTION';
      verdictText = 'Pass with caution (watchlist items present)';
    } else {
      verdictStatus = 'PASS';
      verdictText = 'Pass';
    }
  }

  const totalIngredients = rawList.length;
  const flaggedCount = flagged.length;
  const displayString = `${flaggedCount} of ${totalIngredients} flagged (${highRiskCount} high-risk, ${moderateRiskCount} watchlist) — Score ${score.toFixed(1)}/10`;

  return {
    ruleId: rule.id,
    ruleName: rule.name,
    ruleSlug: rule.slug,
    ruleType: rule.type,
    score,
    tier,
    tierLabel,
    verdictStatus,
    verdictText,
    totalIngredients,
    flaggedCount,
    highRiskCount,
    moderateRiskCount,
    displayString,
    flagged
  };
}

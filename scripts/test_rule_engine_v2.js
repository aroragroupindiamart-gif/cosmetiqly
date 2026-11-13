import { SAFETY_RULES } from '../src/lib/safety_rules_v2.js';
import { evaluateProductRule, normalizeToken } from '../src/lib/rule_engine_v2.js';

console.log('🧪 Running Acceptance Gate Tests for Rule Engine v2...\n');

let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// -------------------------------------------------------------
// Test Case 1: Snail Mucin Product -> Vegan FAIL
// -------------------------------------------------------------
const veganRule = SAFETY_RULES.find(r => r.slug === 'vegan-cruelty-free');
const snailProductIngredients = [
  'Snail Secretion Filtrate',
  'Betaine',
  'Caprylic/Capric Triglyceride',
  'Cetearyl Olivate',
  'Sorbitan Olivate',
  'Sodium Hyaluronate',
  'Allantoin',
  'Panthenol',
  'Phenoxyethanol'
];

const snailResult = evaluateProductRule(snailProductIngredients, veganRule);
assert(snailResult.verdictStatus === 'FAIL', 'Snail mucin formulation must FAIL Vegan & Cruelty-Free rule');
assert(snailResult.flagged.some(f => f.matchedTrigger === 'snail secretion filtrate'), 'Must flag "snail secretion filtrate"');
assert(snailResult.flagged[0].severity === 'HIGH', 'Snail secretion filtrate must be HIGH severity');
assert(snailResult.score <= 7.0, 'Score must reflect high severity penalty (10 - 3 = 7.0)');

// -------------------------------------------------------------
// Test Case 2: Substring Matching Safety (Crucial v1 fix)
// An ingredient present only as a substring of another ingredient must NOT flag
// E.g. "Cetearyl Alcohol" should NOT trigger "Alcohol Denat"
// E.g. "Steareth-20" should NOT trigger "Stearic Acid"
// E.g. "Glyceryl Stearate SE" should NOT trigger "Stearate" via substring
// -------------------------------------------------------------
const alcoholRule = SAFETY_RULES.find(r => r.slug === 'alcohol-free');
const cetearylFormulation = [
  'Aqua (Water)',
  'Glycerin',
  'Cetearyl Alcohol',
  'Caprylic/Capric Triglyceride',
  'Phenoxyethanol'
];

const alcoholResult = evaluateProductRule(cetearylFormulation, alcoholRule);
assert(alcoholResult.verdictStatus === 'PASS', 'Cetearyl Alcohol must NOT trigger simple drying Alcohol rule via substring');
assert(alcoholResult.flaggedCount === 0, 'Flagged count must be 0 for Cetearyl Alcohol under alcohol-free rule');

// -------------------------------------------------------------
// Test Case 3: Real CeraVe Hydrating Cleanser -> Fungal Acne Evaluation
// Official CeraVe Hydrating Cleanser INCI contains:
// Cetearyl Alcohol, Cetyl Alcohol, Stearyl Alcohol (Moderate watchlist), Polysorbate 20 (High risk trigger if present in some batches) or clean
// Let us test exact INCI with Cetearyl Alcohol and Polysorbate 20
// -------------------------------------------------------------
const fungalAcneRule = SAFETY_RULES.find(r => r.slug === 'fungal-acne');
const ceraveInci = [
  'Aqua / Water / Eau',
  'Glycerin',
  'Cetearyl Alcohol',
  'Peg-40 Stearate',
  'Stearyl Alcohol',
  'Potassium Phosphate',
  'Ceramide Np',
  'Ceramide Ap',
  'Ceramide Eop',
  'Carbomer',
  'Glyceryl Stearate',
  'Behentrimonium Methosulfate',
  'Sodium Lauroyl Lactylate',
  'Sodium Hyaluronate',
  'Cholesterol',
  'Phenoxyethanol',
  'Disodium Edta',
  'Dipotassium Phosphate',
  'Tocopherol',
  'Phytosphingosine',
  'Xanthan Gum',
  'Cetyl Alcohol',
  'Ethylhexylglycerin'
];

const ceraveFungalResult = evaluateProductRule(ceraveInci, fungalAcneRule);
// Glyceryl Stearate is HIGH risk, Cetearyl/Stearyl/Cetyl Alcohol are MODERATE
assert(ceraveFungalResult.highRiskCount >= 1, 'CeraVe with Glyceryl Stearate has at least 1 HIGH risk trigger');
assert(ceraveFungalResult.verdictStatus === 'FAIL', 'CeraVe with Glyceryl Stearate fails Fungal Acne standards');
assert(ceraveFungalResult.displayString.includes('flagged'), 'Display string properly formatted');

// -------------------------------------------------------------
// Test Case 4: Pregnancy Rule - High Risk (Retinol) vs Moderate (Avobenzone)
// -------------------------------------------------------------
const pregnancyRule = SAFETY_RULES.find(r => r.slug === 'pregnancy');
const retinolSerum = [
  'Aqua',
  'Squalane',
  'Retinol',
  'Polysorbate 20',
  'BHT'
];
const retinolResult = evaluateProductRule(retinolSerum, pregnancyRule);
assert(retinolResult.verdictStatus === 'FAIL', 'Retinol formulation must FAIL Pregnancy rule');
assert(retinolResult.flagged.some(f => f.matchedTrigger === 'retinol' && f.severity === 'HIGH'), 'Retinol flagged as HIGH severity with citation');

const sunscreenModerateOnly = [
  'Aqua',
  'Avobenzone',
  'Silica',
  'Glycerin'
];
const sunResult = evaluateProductRule(sunscreenModerateOnly, pregnancyRule);
assert(sunResult.verdictStatus === 'CAUTION', 'Moderate-only in risk rule must PASS WITH CAUTION');
assert(sunResult.score === 8.5, '10 - 1.5 = 8.5/10');

// -------------------------------------------------------------
// Test Case 5: 10/10 Score Labeling Check
// "No flagged product is ever labelled Clean"
// -------------------------------------------------------------
const perfectlyCleanProduct = [
  'Aqua',
  'Glycerin',
  'Sodium Hyaluronate',
  'Propanediol'
];
const cleanResult = evaluateProductRule(perfectlyCleanProduct, fungalAcneRule);
assert(cleanResult.score === 10, 'Clean product scores 10/10');
assert(cleanResult.tierLabel === 'No concerns flagged', '10/10 tier label is "No concerns flagged"');

console.log('\n-------------------------------------------------------------');
if (failedTests === 0) {
  console.log('🎉 ALL RULE ENGINE V2 TESTS PASSED WITH 100% ACCURACY!');
} else {
  console.error(`💥 ${failedTests} test(s) failed.`);
  process.exit(1);
}

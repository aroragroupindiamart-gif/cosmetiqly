/**
 * Cosmetiqly Zero-LLM Dynamic Content Synthesizer Engine
 * Generates highly unique, structured clinical breakdowns (>50% uniqueness per URL)
 * using local JavaScript template literals and rule logic. Zero AI API calls or credits.
 */

export function synthesizeBreakdown({ brand, productName, category, ruleName, ruleSlug, status, conflicts, totalIngredients, safetyScore }) {
  const isPass = status === 'PASS';
  const conflictCount = conflicts.length;
  const formattedConflicts = conflicts.length > 0 ? conflicts.join(', ') : 'none';

  // Seed variation index for sentence structures based on product name length
  const variantIndex = (brand.length + productName.length) % 3;

  const passOpeningVariants = [
    `${brand} ${productName} has passed clinical INCI ingredient analysis for ${ruleName} compatibility. Out of ${totalIngredients} total ingredients analyzed in this ${category.toLowerCase()} formula, zero ingredients were flagged as potential triggers for ${ruleName.toLowerCase()}.`,
    `Good news for sensitive skin: ${brand} ${productName} is 100% compliant with ${ruleName} guidelines. Our Cosmetiqly safety algorithm evaluated all ${totalIngredients} components in this formulation and found no blacklisted agents triggering ${ruleName.toLowerCase()}.`,
    `Clinical INCI evaluation confirms that ${brand} ${productName} is safe for users concerned about ${ruleName}. None of the ${totalIngredients} ingredients listed in its formulation trigger ${ruleName.toLowerCase()} sensitivity.`
  ];

  const failOpeningVariants = [
    `Caution: ${brand} ${productName} is classified as NOT SAFE under ${ruleName} evaluation standards. Out of ${totalIngredients} total INCI ingredients, our Cosmetiqly diagnostic engine identified ${conflictCount} flagged trigger ingredient(s): ${formattedConflicts}.`,
    `Analysis indicates that ${brand} ${productName} does not meet strict ${ruleName} safety criteria. This formulation contains ${conflictCount} blacklisted component(s) known to exacerbate ${ruleName.toLowerCase()}: ${formattedConflicts}.`,
    `${brand} ${productName} received a status of FAIL for ${ruleName}. Our safety rule engine screened ${totalIngredients} formulation ingredients and detected ${conflictCount} active trigger(s): ${formattedConflicts}.`
  ];

  const openingParagraph = isPass 
    ? passOpeningVariants[variantIndex] 
    : failOpeningVariants[variantIndex];

  const scoreExplanation = isPass
    ? `This product achieves an optimal Cosmetiqly Safety Score of ${safetyScore}%. It is suitable for daily skincare routines prioritizing ${ruleName.toLowerCase()} protection.`
    : `With a calculated Cosmetiqly Safety Score of ${safetyScore}%, individuals requiring strict ${ruleName.toLowerCase()} avoidance should evaluate alternative products or patch test with caution.`;

  return {
    openingParagraph,
    scoreExplanation,
    verdictSummary: isPass
      ? `Verified ${ruleName} Safe (${totalIngredients} Clean Ingredients)`
      : `Contains ${conflictCount} Flagged Trigger(s) for ${ruleName}`
  };
}

export function generateFAQ({ brand, productName, ruleName, status, conflicts, safetyScore }) {
  const isPass = status === 'PASS';
  return [
    {
      question: `Is ${brand} ${productName} ${ruleName} safe?`,
      answer: isPass
        ? `Yes, ${brand} ${productName} is confirmed ${ruleName} safe. None of its ingredients were found to conflict with ${ruleName.toLowerCase()} standards.`
        : `No, ${brand} ${productName} is not ${ruleName} safe. It contains ${conflicts.length} flagged trigger ingredient(s): ${conflicts.join(', ')}.`
    },
    {
      question: `What is the safety score of ${brand} ${productName} for ${ruleName}?`,
      answer: `${brand} ${productName} earned a Cosmetiqly safety score of ${safetyScore}% for ${ruleName} compatibility.`
    },
    {
      question: `How does Cosmetiqly analyze ${brand} ${productName}?`,
      answer: `Cosmetiqly performs automated INCI ingredient parsing across 15 medical and dermatological filter databases to detect potential allergens, pore-cloggers, and skin irritants.`
    }
  ];
}

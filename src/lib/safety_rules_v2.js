/**
 * Cosmetiqly Safety Rules v2 Definitions & Cited Ingredient Blacklists
 * Every ingredient is paired with:
 * - severity: 'HIGH' | 'MODERATE'
 * - citation: CIR, SCCS, FDA, or peer-reviewed dermatological study
 * - note: clinical explanation
 * 
 * Rules are categorized by type:
 * - type: 'free' -> fails on ANY flagged ingredient
 * - type: 'risk' -> fails on ANY high-risk trigger; passes with caution on moderate-only
 */

export const SAFETY_RULES = [
  {
    id: 'rule-fungal-acne',
    name: 'Fungal Acne (Malassezia)',
    slug: 'fungal-acne',
    type: 'risk',
    description: 'Screens for lipids, fatty acids (C11-C24), esters, and polysorbates that feed Malassezia yeast folliculitis.',
    relevantCategories: ['skincare', 'face', 'moisturizer', 'cleanser', 'serum', 'sunscreen', 'cream', 'lotion', 'mask', 'oil', 'toner'],
    triggers: [
      { name: 'polysorbate 20', severity: 'HIGH', citation: 'PMID: 15752284 (Malassezia lipid nutrition)', note: 'Ester of fatty acid that directly fuels Malassezia growth.' },
      { name: 'polysorbate 40', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Fatty acid ester hydrolysed by Malassezia lipases.' },
      { name: 'polysorbate 60', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Palmitic acid ester supporting yeast proliferation.' },
      { name: 'polysorbate 80', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Oleic acid source readily consumed by Malassezia.' },
      { name: 'isopropyl myristate', severity: 'HIGH', citation: 'PMID: 6588260', note: 'C14 fatty ester strongly promoting pityrosporum yeast.' },
      { name: 'isopropyl palmitate', severity: 'HIGH', citation: 'PMID: 6588260', note: 'C16 fatty ester triggering fungal acne breakouts.' },
      { name: 'glyceryl stearate', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Stearic acid lipid ester utilized by Malassezia species.' },
      { name: 'oleic acid', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Direct unsaturated fatty acid substrate for Malassezia.' },
      { name: 'palmitic acid', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Saturated C16 fatty acid feeding Malassezia.' },
      { name: 'stearic acid', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Saturated C18 fatty acid substrate for yeast lipases.' },
      { name: 'lauric acid', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Medium-chain C12 fatty acid feeding yeast.' },
      { name: 'myristic acid', severity: 'HIGH', citation: 'PMID: 15752284', note: 'C14 fatty acid metabolised by Malassezia.' },
      { name: 'cetearyl alcohol', severity: 'MODERATE', citation: 'Dermatol Clin 2021', note: 'Fatty alcohol blend; generally tolerated in low amounts but watchlist for severe folliculitis.' },
      { name: 'cetyl alcohol', severity: 'MODERATE', citation: 'Dermatol Clin 2021', note: 'C16 fatty alcohol; occasional cofactor in barrier disruption.' },
      { name: 'stearyl alcohol', severity: 'MODERATE', citation: 'Dermatol Clin 2021', note: 'C18 fatty alcohol; weak potential cofactor.' }
    ]
  },
  {
    id: 'rule-pregnancy',
    name: 'Pregnancy & Lactation',
    slug: 'pregnancy',
    type: 'risk',
    description: 'Screens for teratogenic, high-systemic absorption agents (retinoids, hydroquinone) and high-dose chemical filters.',
    relevantCategories: ['skincare', 'face', 'serum', 'cream', 'lotion', 'sunscreen', 'oil', 'treatment'],
    triggers: [
      { name: 'retinol', severity: 'HIGH', citation: 'ACOG Practice Bulletin No. 203', note: 'Topical vitamin A derivative contraindicated during pregnancy due to teratogenicity risk.' },
      { name: 'retinyl palmitate', severity: 'HIGH', citation: 'ACOG Practice Bulletin No. 203', note: 'Retinoid ester contraindicated during gestation.' },
      { name: 'retinal', severity: 'HIGH', citation: 'ACOG Practice Bulletin No. 203', note: 'Direct retinoid precursor to retinoic acid.' },
      { name: 'adapalene', severity: 'HIGH', citation: 'FDA Pregnancy Category C / Teratogenicity Guidelines', note: 'Third-generation topical retinoid avoided in pregnancy.' },
      { name: 'tretinoin', severity: 'HIGH', citation: 'FDA Black Box Precaution / Teratogenicity', note: 'All-trans retinoic acid contraindicated in pregnancy.' },
      { name: 'hydroquinone', severity: 'HIGH', citation: 'J Am Acad Dermatol 2011; 64:824-830', note: 'Significant systemic absorption (up to 35-45%); contraindicated.' },
      { name: 'salicylic acid', severity: 'MODERATE', citation: 'ACOG Clinical Guidelines 2020', note: 'High concentrations (>2%) and chemical peels avoided; low rinse-off use is typically monitored.' },
      { name: 'oxybenzone', severity: 'MODERATE', citation: 'Environ Health Perspect 2018', note: 'Endocrine disruption concerns and measurable systemic plasma absorption.' },
      { name: 'avobenzone', severity: 'MODERATE', citation: 'FDA Sunscreen Safety Guidance', note: 'Systemic absorption across skin barrier; mineral filters (zinc oxide) preferred.' }
    ]
  },
  {
    id: 'rule-non-comedogenic',
    name: 'Non-Comedogenic',
    slug: 'non-comedogenic',
    type: 'risk',
    description: 'Evaluates ingredients with published rabbit ear / human microcomedone ratings of 4 or 5.',
    relevantCategories: ['skincare', 'face', 'moisturizer', 'cleanser', 'serum', 'makeup', 'foundation', 'cream'],
    triggers: [
      { name: 'isopropyl isostearate', severity: 'HIGH', citation: 'Fulton JE, Comedogenicity Table (J Soc Cosmet Chem 1989)', note: 'Comedogenicity score 4-5; severe pore-clogging potential.' },
      { name: 'isopropyl myristate', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Comedogenicity score 5; causes microcomedones in acne-prone skin.' },
      { name: 'isopropyl palmitate', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Comedogenicity score 4; heavy follicular plugging.' },
      { name: 'myristyl myristate', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Comedogenicity score 5; highly occlusive pore clogger.' },
      { name: 'acetylated lanolin', severity: 'HIGH', citation: 'Kligman AM, Mills OH (Arch Dermatol 1972)', note: 'Comedogenicity score 4-5.' },
      { name: 'coconut oil', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Cocos nucifera oil has comedogenicity score 4.' },
      { name: 'cocoa butter', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Theobroma cacao seed butter score 4.' },
      { name: 'lauric acid', severity: 'HIGH', citation: 'Fulton JE, 1989', note: 'Comedogenicity score 4.' },
      { name: 'cetearyl alcohol', severity: 'MODERATE', citation: 'Fulton JE, 1989', note: 'Comedogenicity score 2 when used alone, score 4 when combined with ceteareth-20.' },
      { name: 'ethylhexyl palmitate', severity: 'MODERATE', citation: 'J Am Acad Dermatol', note: 'Comedogenicity score 3-4 depending on base matrix.' }
    ]
  },
  {
    id: 'rule-silicone-free',
    name: 'Silicone-Free',
    slug: 'silicone-free',
    type: 'free',
    description: 'Screens for occlusive dimethicones, siloxanes, and synthetic silicone polymers.',
    relevantCategories: ['skincare', 'hair', 'shampoo', 'conditioner', 'face', 'serum', 'moisturizer', 'makeup'],
    triggers: [
      { name: 'dimethicone', severity: 'HIGH', citation: 'CIR Safety Assessment of Dimethicone', note: 'Linear polydimethylsiloxane polymer.' },
      { name: 'cyclomethicone', severity: 'HIGH', citation: 'SCCS/1241/10', note: 'Volatile cyclic siloxane blend.' },
      { name: 'cyclopentasiloxane', severity: 'HIGH', citation: 'SCCS Opinion D5', note: 'Cyclic organosilicon compound.' },
      { name: 'cyclohexasiloxane', severity: 'HIGH', citation: 'SCCS Opinion D6', note: 'Cyclic siloxane polymer.' },
      { name: 'amodimethicone', severity: 'HIGH', citation: 'CIR Safety Review', note: 'Amine-functionalized silicone.' },
      { name: 'dimethiconol', severity: 'HIGH', citation: 'CIR Safety Review', note: 'Hydroxyl-terminated silicone fluid.' },
      { name: 'phenyl trimethicone', severity: 'HIGH', citation: 'CIR Review', note: 'Phenylated silicone fluid.' },
      { name: 'cetyl dimethicone', severity: 'HIGH', citation: 'CIR Review', note: 'Alkyl-modified silicone polymer.' }
    ]
  },
  {
    id: 'rule-fragrance-free',
    name: 'Fragrance-Free',
    slug: 'fragrance-free',
    type: 'free',
    description: 'Screens for synthetic perfumes (parfum) and EU 26 regulated contact allergen aromatic compounds.',
    relevantCategories: ['skincare', 'body', 'face', 'hair', 'baby', 'sunscreen', 'cleanser'],
    triggers: [
      { name: 'fragrance', severity: 'HIGH', citation: 'EU Cosmetics Regulation Annex III / IFRA', note: 'Undisclosed synthetic perfume mixture.' },
      { name: 'parfum', severity: 'HIGH', citation: 'EU Cosmetics Regulation Annex III', note: 'Standard European INCI designation for undisclosed scent mixtures.' },
      { name: 'linalool', severity: 'HIGH', citation: 'SCCS/1459/11 (Fragrance Allergens in Cosmetic Products)', note: 'Terpene that oxidizes on skin into potent contact allergens.' },
      { name: 'limonene', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Common fragrance allergen with high sensitization rate upon oxidation.' },
      { name: 'citronellol', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Regulated contact fragrance allergen.' },
      { name: 'geraniol', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Monoterpenoid fragrance allergen requiring declaration in the EU.' },
      { name: 'coumarin', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Known contact allergen and photosensitizer.' },
      { name: 'citral', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Sensitizing aldehyde mixture.' },
      { name: 'hydroxycitronellal', severity: 'HIGH', citation: 'SCCS/1459/11', note: 'Established fragrance contact allergen.' }
    ]
  },
  {
    id: 'rule-paraben-free',
    name: 'Paraben-Free',
    slug: 'paraben-free',
    type: 'free',
    description: 'Screens for alkyl ester preservatives derived from para-hydroxybenzoic acid.',
    relevantCategories: ['skincare', 'body', 'face', 'hair', 'makeup', 'baby'],
    triggers: [
      { name: 'methylparaben', severity: 'HIGH', citation: 'CIR Final Amended Report on Parabens', note: 'Short-chain alkyl paraben preservative.' },
      { name: 'propylparaben', severity: 'HIGH', citation: 'SCCS/1514/13 Opinion on Parabens', note: 'Longer chain paraben with restricted concentration limits in the EU.' },
      { name: 'butylparaben', severity: 'HIGH', citation: 'SCCS/1514/13', note: 'Butyl ester of 4-hydroxybenzoic acid.' },
      { name: 'ethylparaben', severity: 'HIGH', citation: 'CIR Parabens Safety Assessment', note: 'Ethyl ester preservative.' },
      { name: 'isobutylparaben', severity: 'HIGH', citation: 'EU Regulation 358/2014 (Banned in EU)', note: 'Branched-chain paraben banned in the EU due to endocrine concerns.' },
      { name: 'isopropylparaben', severity: 'HIGH', citation: 'EU Regulation 358/2014 (Banned in EU)', note: 'Banned in EU cosmetic products.' }
    ]
  },
  {
    id: 'rule-sulfate-free',
    name: 'Sulfate-Free',
    slug: 'sulfate-free',
    type: 'free',
    description: 'Screens for aggressive alkyl sulfate surfactants that strip skin lipophilic barrier.',
    relevantCategories: ['hair', 'shampoo', 'cleanser', 'body-wash', 'face'],
    triggers: [
      { name: 'sodium lauryl sulfate', severity: 'HIGH', citation: 'CIR Safety Assessment of Sodium Lauryl Sulfate', note: 'Harsh anionic detergent and standard model skin irritant.' },
      { name: 'sodium laureth sulfate', severity: 'HIGH', citation: 'CIR Safety Assessment', note: 'Ethoxylated sulfate surfactant prone to stripping barrier lipids.' },
      { name: 'ammonium lauryl sulfate', severity: 'HIGH', citation: 'CIR Review', note: 'Strong cleansing sulfate surfactant.' },
      { name: 'ammonium laureth sulfate', severity: 'HIGH', citation: 'CIR Review', note: 'Ethoxylated surfactant.' },
      { name: 'sodium coco-sulfate', severity: 'HIGH', citation: 'Cosmetic Ingredient Review', note: 'Broad coconut alkyl sulfate blend containing natural sodium lauryl sulfate.' }
    ]
  },
  {
    id: 'rule-alcohol-free',
    name: 'Alcohol-Free',
    slug: 'alcohol-free',
    type: 'free',
    description: 'Screens for simple low-molecular-weight drying alcohols (does not flag beneficial fatty alcohols).',
    relevantCategories: ['skincare', 'face', 'toner', 'serum', 'moisturizer', 'sunscreen'],
    triggers: [
      { name: 'alcohol denat.', severity: 'HIGH', citation: 'CIR Safety Assessment of Alcohol Denat.', note: 'Simple volatile drying alcohol disrupting epidermal moisture barrier.' },
      { name: 'alcohol denat', severity: 'HIGH', citation: 'CIR Assessment', note: 'Denatured ethanol variant.' },
      { name: 'sd alcohol 40', severity: 'HIGH', citation: 'CIR Assessment', note: 'Specially denatured alcohol.' },
      { name: 'sd alcohol 40-b', severity: 'HIGH', citation: 'CIR Assessment', note: 'Drying ethanol grade.' },
      { name: 'isopropyl alcohol', severity: 'HIGH', citation: 'CIR Safety Review', note: 'Fast-evaporating dehydrating alcohol.' },
      { name: 'ethanol', severity: 'HIGH', citation: 'CIR Review', note: 'Pure simple volatile alcohol.' },
      { name: 'benzyl alcohol', severity: 'MODERATE', citation: 'SCCS Fragrance & Preservative Evaluation', note: 'Preservative alcohol; low drying effect but potential contact sensitizer.' }
    ]
  },
  {
    id: 'rule-vegan-cruelty-free',
    name: 'Vegan & Cruelty-Free',
    slug: 'vegan-cruelty-free',
    type: 'free',
    description: 'Screens for animal-derived tissues, secretions, insect derivatives, and lanolin.',
    relevantCategories: ['skincare', 'makeup', 'lip', 'body', 'hair', 'cream', 'face'],
    triggers: [
      { name: 'snail secretion filtrate', severity: 'HIGH', citation: 'PETA / Vegan Society Standards', note: 'Direct animal excretion harvested from snails.' },
      { name: 'lanolin', severity: 'HIGH', citation: 'Vegan Society Standards', note: 'Wax secreted by the sebaceous glands of wool-bearing sheep.' },
      { name: 'cera alba', severity: 'HIGH', citation: 'Vegan Society Standards', note: 'Natural beeswax produced by honey bees.' },
      { name: 'beeswax', severity: 'HIGH', citation: 'Vegan Society Standards', note: 'Animal byproduct from Apis mellifera.' },
      { name: 'carmine', severity: 'HIGH', citation: 'CI 75470 / Vegan Action', note: 'Red dye derived from crushed female cochineal insects.' },
      { name: 'ci 75470', severity: 'HIGH', citation: 'INCI Colour Index', note: 'Carmine pigment from scale insects.' },
      { name: 'collagen', severity: 'HIGH', citation: 'Vegan Society', note: 'Typically bovine, porcine, or marine derived animal connective tissue.' },
      { name: 'keratin', severity: 'HIGH', citation: 'Vegan Society', note: 'Animal protein extracted from feathers, hooves, or wool.' },
      { name: 'gelatin', severity: 'HIGH', citation: 'Vegan Society', note: 'Hydrolyzed animal collagen protein.' }
    ]
  },
  {
    id: 'rule-reef-safe',
    name: 'Reef-Safe Sunscreen',
    slug: 'reef-safe',
    type: 'free',
    description: 'Screens for Hawaii Act 104 and Key West banned UV chemical filters causing coral bleaching.',
    relevantCategories: ['sunscreen', 'spf', 'sun', 'solar'],
    triggers: [
      { name: 'oxybenzone', severity: 'HIGH', citation: 'Hawaii Senate Bill 2571 / Downs et al., Arch Environ Contam Toxicol 2016', note: 'Banned coral-bleaching chemical filter that deforms coral larvae.' },
      { name: 'octinoxate', severity: 'HIGH', citation: 'Hawaii Act 104 (2021)', note: 'Banned UV filter causing coral reef bleaching.' },
      { name: 'octocrylene', severity: 'HIGH', citation: 'US Virgin Islands Ban (Act 8185)', note: 'Degrades into benzophenone over time; toxic to marine aquatic life.' },
      { name: 'homosalate', severity: 'MODERATE', citation: 'SCCS/1638/21', note: 'Environmental accumulation and human endocrine evaluation.' },
      { name: 'avobenzone', severity: 'MODERATE', citation: 'National Academies of Sciences, Engineering, and Medicine (2022)', note: 'Photodegradation products impact aquatic ecosystems.' }
    ]
  },
  {
    id: 'rule-rosacea-eczema',
    name: 'Rosacea & Eczema-Safe',
    slug: 'rosacea-eczema',
    type: 'risk',
    description: 'Screens for stinging acids, aggressive retinoids, synthetic dyes, and known vascular flare triggers.',
    relevantCategories: ['skincare', 'face', 'cream', 'serum', 'lotion', 'cleanser'],
    triggers: [
      { name: 'glycolic acid', severity: 'HIGH', citation: 'National Rosacea Society (NRS) Clinical Survey', note: 'Smallest molecular alpha-hydroxy acid with high sting index in rosacea.' },
      { name: 'lactic acid', severity: 'MODERATE', citation: 'NRS Trigger List', note: 'Exfoliating AHA; moderate irritation risk in compromised barriers.' },
      { name: 'alcohol denat.', severity: 'HIGH', citation: 'NRS Guidelines', note: 'Causes stinging, erythema, and vascular vasodilation.' },
      { name: 'menthol', severity: 'HIGH', citation: 'NRS Trigger List', note: 'Counter-irritant causing vasodilation and burning sensation.' },
      { name: 'camphor', severity: 'HIGH', citation: 'NRS Trigger List', note: 'Vascular irritant triggering flush reactions.' },
      { name: 'eucalyptus globulus leaf oil', severity: 'HIGH', citation: 'NRS Guidelines', note: 'Essential oil compound causing flare-ups.' },
      { name: 'sodium lauryl sulfate', severity: 'HIGH', citation: 'National Eczema Association', note: 'Disrupts defective filaggrin skin barrier.' },
      { name: 'fragrance', severity: 'HIGH', citation: 'American Contact Dermatitis Society (ACDS)', note: 'Leading contact allergen in eczema patients.' },
      { name: 'parfum', severity: 'HIGH', citation: 'ACDS Guidelines', note: 'Sensitizing aromatic mixture.' }
    ]
  },
  {
    id: 'rule-malassezia-free',
    name: 'Malassezia Yeast Free',
    slug: 'malassezia-free',
    type: 'risk',
    description: 'Strict yeast isolation filter targeting fungal folliculitis and seborrheic dermatitis cofactors.',
    relevantCategories: ['skincare', 'face', 'shampoo', 'hair', 'scalp', 'cream', 'serum'],
    triggers: [
      { name: 'polysorbate 20', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Fatty acid ester feeding Malassezia yeast.' },
      { name: 'polysorbate 80', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Nutrient source for Malassezia lipases.' },
      { name: 'olive oil', severity: 'HIGH', citation: 'J Invest Dermatol 2013', note: 'High oleic acid lipid profile exacerbating Malassezia.' },
      { name: 'coconut oil', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Triglycerides broken down into fungal food.' },
      { name: 'glyceryl stearate', severity: 'HIGH', citation: 'PMID: 15752284', note: 'Ester metabolized by fungal lipases.' }
    ]
  },
  {
    id: 'rule-nut-allergy',
    name: 'Nut-Allergy Safe',
    slug: 'nut-allergy-safe',
    type: 'free',
    description: 'Screens for tree nut and peanut botanical seed oils, flours, and nut shell exfoliants.',
    relevantCategories: ['skincare', 'body', 'face', 'hair', 'lip', 'oil', 'cream'],
    triggers: [
      { name: 'prunus amygdalus dulcis oil', severity: 'HIGH', citation: 'AAAAI Food Allergy Guidelines', note: 'Sweet almond oil derived from tree nuts.' },
      { name: 'sweet almond oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Tree nut oil posing contact and cross-contamination risks.' },
      { name: 'macadamia ternifolia seed oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Macadamia nut oil.' },
      { name: 'macadamia integrifolia seed oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Macadamia nut lipid extract.' },
      { name: 'juglans regia shell powder', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Walnut shell abrasive powder.' },
      { name: 'corylus avellana seed oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Hazelnut seed oil.' },
      { name: 'arachis hypogaea oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Peanut oil.' },
      { name: 'pistacia vera seed oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Pistachio nut oil.' },
      { name: 'anacardium occidentale seed oil', severity: 'HIGH', citation: 'AAAAI Guidelines', note: 'Cashew nut oil.' }
    ]
  },
  {
    id: 'rule-gluten-free',
    name: 'Gluten-Free',
    slug: 'gluten-free',
    type: 'free',
    description: 'Screens for wheat, barley, rye, and oat hydrolysates relevant to celiac disease and dermatitis herpetiformis.',
    relevantCategories: ['skincare', 'lip', 'makeup', 'face', 'body', 'hair'],
    triggers: [
      { name: 'triticum vulgare germ oil', severity: 'HIGH', citation: 'Celiac Disease Foundation', note: 'Wheat germ oil.' },
      { name: 'triticum vulgare flour lipids', severity: 'HIGH', citation: 'Celiac Disease Foundation', note: 'Wheat flour lipids.' },
      { name: 'hydrolyzed wheat protein', severity: 'HIGH', citation: 'Contact Dermatitis 2012', note: 'Wheat gluten protein and established IgE contact allergen.' },
      { name: 'hordeum vulgare seed extract', severity: 'HIGH', citation: 'Celiac Disease Foundation', note: 'Barley seed extract containing gluten.' },
      { name: 'secale cereale seed extract', severity: 'HIGH', citation: 'Celiac Disease Foundation', note: 'Rye grain extract.' },
      { name: 'hydrolyzed wheat starch', severity: 'HIGH', citation: 'Celiac Disease Foundation', note: 'Starch fraction with potential gluten peptide traces.' }
    ]
  },
  {
    id: 'rule-phthalate-free',
    name: 'Phthalate-Free',
    slug: 'phthalate-free',
    type: 'free',
    description: 'Screens for dialkyl or alkyl aryl esters of 1,2-benzenedicarboxylic acid plasticizers and fragrance fixatives.',
    relevantCategories: ['skincare', 'makeup', 'perfume', 'hair', 'body'],
    triggers: [
      { name: 'diethyl phthalate', severity: 'HIGH', citation: 'SCCS/1183/08 Opinion on Phthalates', note: 'Widely scrutinized fragrance solvent and endocrine disruption candidate.' },
      { name: 'dimethyl phthalate', severity: 'HIGH', citation: 'CIR Safety Assessment', note: 'Dialkyl phthalate solvent.' },
      { name: 'dibutyl phthalate', severity: 'HIGH', citation: 'EU Regulation 1223/2009 Annex II (Banned in EU)', note: 'Banned reprotoxic plasticizer.' },
      { name: 'di-2-ethylhexyl phthalate', severity: 'HIGH', citation: 'EU Regulation Annex II (Banned)', note: 'DEHP banned reproductive toxicant.' }
    ]
  }
];

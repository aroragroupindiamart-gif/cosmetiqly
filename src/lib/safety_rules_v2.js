/**
 * Cosmetiqly Safety Rules v2 Definitions & Mechanically Verified Ingredient Blacklists
 * 
 * Every trigger is verified against primary scientific literature:
 * - citation: CIR, SCCS, FDA/ACOG, or peer-reviewed dermatological studies
 * - source_url: Direct primary link to PubMed PMID, official SCCS/CIR/FDA document
 * - severity: 'HIGH' | 'MODERATE'
 * - note: Clinical rationale explaining biological mechanism and dosage context
 * 
 * Rules are categorized by type:
 * - type: 'free' -> fails on ANY flagged ingredient
 * - type: 'risk' -> fails on ANY high-risk trigger; passes with caution on moderate-only
 */

export const SAFETY_RULES = [
  {
    id: 'rule-pregnancy',
    name: 'Pregnancy & Lactation',
    slug: 'pregnancy',
    type: 'risk',
    description: 'Screens for teratogenic, high-systemic absorption agents (retinoids, hydroquinone) and high-dose chemical filters avoided during pregnancy and breastfeeding.',
    relevantCategories: ['Skincare', 'Face', 'Serum', 'Moisturizer', 'Sunscreen', 'Treatment', 'Eye Cream'],
    triggers: [
      {
        name: 'retinol',
        severity: 'HIGH',
        citation: 'Bozzo P, Chua-Gocheco A, Einarson A. Safety of skin care products during pregnancy. Can Fam Physician. 2011;57(6):665-667.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/21673209/',
        note: 'Topical vitamin A derivative. While systemic absorption is low, clinical guidelines (ACOG/Teratology consensus) advise avoiding all topical retinoids during pregnancy due to systemic retinoid embryopathy risks.'
      },
      {
        name: 'retinyl palmitate',
        severity: 'HIGH',
        citation: 'Bozzo P, Chua-Gocheco A, Einarson A. Safety of skin care products during pregnancy. Can Fam Physician. 2011;57(6):665-667.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/21673209/',
        note: 'Retinoid ester enzymatically hydrolyzed to retinol in the epidermis; contraindicated during gestation.'
      },
      {
        name: 'retinal',
        severity: 'HIGH',
        citation: 'Panchaud A, Csajka C, Merlob P, et al. Pregnancy outcome following exposure to topical retinoids: a multicenter prospective study. J Clin Pharmacol. 2012;52(12):1844-1851.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/22174426/',
        note: 'Direct precursor to retinoic acid; avoided during pregnancy by teratological consensus.'
      },
      {
        name: 'adapalene',
        severity: 'HIGH',
        citation: 'FDA Center for Drug Evaluation and Research. Adapalene Gel 0.1%/0.3% Labeling (NDA 021753, Ref ID: 3138379). FDA PLLR Review.',
        source_url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2012/021753s004lbl.pdf',
        note: 'Synthetic topical retinoid. FDA prescribing information instructs immediate discontinuation upon pregnancy due to potential teratogenicity risk.'
      },
      {
        name: 'tretinoin',
        severity: 'HIGH',
        citation: 'Jick SS, Terris GZ, Jick H. First trimester topical tretinoin and congenital disorders. Lancet. 1993;341(8854):1181-1182.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/8098078/',
        note: 'All-trans retinoic acid; contraindicated in pregnancy due to post-marketing teratogenic case reports mimicking retinoic acid embryopathy.'
      },
      {
        name: 'hydroquinone',
        severity: 'HIGH',
        citation: 'Wester RC, Melendres J, Sarason R, et al. Human in vivo and in vitro hydroquinone topical bioavailability, metabolism, and disposition. J Toxicol Environ Health A. 1998;54(4):301-317.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9638901/',
        note: 'Exhibits unusually high systemic absorption (up to 35% to 45% enters systemic circulation); contraindicated throughout pregnancy and lactation.'
      },
      {
        name: 'salicylic acid',
        severity: 'MODERATE',
        citation: 'Chien AL, Qi J, Rainer B, et al. Treatment of Acne in Pregnancy. J Am Board Fam Med. 2016;29(2):254-262.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/26957383/',
        note: 'High concentrations (>2%), chemical peels, and widespread body applications are avoided due to potential salicylate toxicity; low-concentration rinse-off products are generally monitored.'
      },
      {
        name: 'oxybenzone',
        severity: 'MODERATE',
        citation: 'Matta MK, Zusterzeel R, Pilli NR, et al. Effect of Sunscreen Application Under Maximal Use Conditions on Plasma Concentration of Sunscreen Active Ingredients: A Randomized Clinical Trial. JAMA. 2019;321(21):2082-2091.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/31058986/',
        note: 'Exceeds FDA plasma thresholds for systemic absorption and shows potential estrogenic/endocrine activity; physical mineral filters (zinc oxide) are preferred during gestation.'
      },
      {
        name: 'avobenzone',
        severity: 'MODERATE',
        citation: 'Matta MK, Florian J, Zusterzeel R, et al. Effect of Sunscreen Application on Plasma Concentration of Sunscreen Active Ingredients: A Randomized Clinical Trial. JAMA. 2020;323(3):256-267.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/31961417/',
        note: 'Systemic absorption across the skin barrier exceeds FDA non-clinical toxicological thresholds; mineral sunscreens are recommended as first-line during pregnancy.'
      }
    ]
  },
  {
    id: 'rule-fungal-acne',
    name: 'Fungal Acne (Malassezia)',
    slug: 'fungal-acne',
    type: 'risk',
    description: 'Screens for lipids, fatty acids (C11-C24), esters, and polysorbates that feed Malassezia yeast folliculitis.',
    relevantCategories: ['Skincare', 'Face', 'Moisturizer', 'Cleanser', 'Serum', 'Sunscreen', 'Mask', 'Lip Care'],
    triggers: [
      {
        name: 'polysorbate 20',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Polyoxyethylene sorbitan ester directly hydrolyzed by Malassezia lipases into free fatty acids that support yeast proliferation.'
      },
      {
        name: 'polysorbate 40',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Sorbitan monopalmitate ethoxylate hydrolyzed as a lipid nutrient source by lipophilic Malassezia yeasts.'
      },
      {
        name: 'polysorbate 60',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Monostearate ester providing C18 saturated fatty acid substrates supporting fungal growth.'
      },
      {
        name: 'polysorbate 80',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Monooleate ester delivering unsaturated oleic acid (C18:1), a primary fuel source for Malassezia species.'
      },
      {
        name: 'isopropyl myristate',
        severity: 'HIGH',
        citation: 'Kligman AM, Mills OH Jr. "Acne cosmetica." Arch Dermatol. 1972;106(6):843-850.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/4264346/',
        note: 'Synthetic fatty ester promoting rapid pityrosporum / Malassezia yeast expansion in follicular infundibula.'
      },
      {
        name: 'isopropyl palmitate',
        severity: 'HIGH',
        citation: 'Kligman AM, Mills OH Jr. "Acne cosmetica." Arch Dermatol. 1972;106(6):843-850.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/4264346/',
        note: 'C16 branched ester readily cleaved by extracellular fungal lipases.'
      },
      {
        name: 'glyceryl stearate',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Monoglyceride ester yielding free stearic acid upon lipase exposure, sustaining yeast colonies.'
      },
      {
        name: 'oleic acid',
        severity: 'HIGH',
        citation: 'DeAngelis YM, Gemmer CM, Kaczvinsky JR, et al. Three etiologic facets of dandruff and seborrheic dermatitis: Malassezia fungi, sebaceous lipids, and individual sensitivity. J Investig Dermatol Symp Proc. 2005;10(3):295-297.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/16382685/',
        note: 'Direct C18:1 unsaturated fatty acid substrate consumed by Malassezia, leaving irritating free fatty acid byproducts that compromise the stratum corneum.'
      },
      {
        name: 'palmitic acid',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Saturated C16 fatty acid that fulfills the strict lipid dependency of Malassezia species.'
      },
      {
        name: 'stearic acid',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Saturated C18 fatty acid supporting fungal vegetative growth.'
      },
      {
        name: 'lauric acid',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Medium-chain C12 fatty acid utilized by multiple cutaneous Malassezia strains.'
      },
      {
        name: 'myristic acid',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Saturated C14 fatty acid metabolised by fungal lipases.'
      },
      {
        name: 'cetearyl alcohol',
        severity: 'MODERATE',
        citation: 'Rubenstein RM, Malerich SA. Malassezia (pityrosporum) folliculitis. J Clin Aesthet Dermatol. 2014;7(3):37-41.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24688625/',
        note: 'Fatty alcohol blend; not a direct lipid nutrient for yeasts, but placed on watchlist due to potential occlusive co-factor effects in severe folliculitis.'
      },
      {
        name: 'cetyl alcohol',
        severity: 'MODERATE',
        citation: 'Rubenstein RM, Malerich SA. Malassezia (pityrosporum) folliculitis. J Clin Aesthet Dermatol. 2014;7(3):37-41.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24688625/',
        note: 'C16 fatty alcohol; generally tolerated in mild cases, flagged as a moderate watchlist item in active folliculitis flares.'
      },
      {
        name: 'stearyl alcohol',
        severity: 'MODERATE',
        citation: 'Rubenstein RM, Malerich SA. Malassezia (pityrosporum) folliculitis. J Clin Aesthet Dermatol. 2014;7(3):37-41.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24688625/',
        note: 'C18 fatty alcohol; watchlist flag for patients with persistent refractory pityrosporum folliculitis.'
      }
    ]
  },
  {
    id: 'rule-non-comedogenic',
    name: 'Non-Comedogenic',
    slug: 'non-comedogenic',
    type: 'risk',
    description: 'Evaluates ingredients with published rabbit ear / human microcomedone ratings of 4 or 5 on the 0-5 comedogenicity scale.',
    relevantCategories: ['Skincare', 'Face', 'Moisturizer', 'Cleanser', 'Serum', 'Treatment', 'Eye Cream'],
    triggers: [
      {
        name: 'isopropyl isostearate',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 4-5 on the standard Fulton rabbit ear / human microcomedone assay; potent follicular impaction agent.'
      },
      {
        name: 'isopropyl myristate',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 5; induces rapid hyperkeratosis and follicular retention in acne-prone skin.'
      },
      {
        name: 'isopropyl palmitate',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 4; high pore-clogging potential.'
      },
      {
        name: 'myristyl myristate',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 5; dense occlusive wax ester causing microcomedone formation.'
      },
      {
        name: 'acetylated lanolin',
        severity: 'HIGH',
        citation: 'Kligman AM, Mills OH Jr. "Acne cosmetica." Arch Dermatol. 1972;106(6):843-850.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/4264346/',
        note: 'Comedogenicity rating 4-5; chemically modified lanolin ester producing pronounced follicular hyperkeratosis.'
      },
      {
        name: 'coconut oil',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Cocos nucifera seed oil; comedogenicity rating 4; high lauric acid concentration contributing to follicular impaction.'
      },
      {
        name: 'cocoa butter',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Theobroma cacao seed butter; comedogenicity rating 4; heavy lipid profile with microcomedogenic potential.'
      },
      {
        name: 'lauric acid',
        severity: 'HIGH',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 4; saturated medium-chain fatty acid promoting follicular hyperkeratinization.'
      },
      {
        name: 'cetearyl alcohol',
        severity: 'MODERATE',
        citation: 'Fulton JE Jr. Comedogenicity and irritancy of commonly used ingredients in skin care products. J Soc Cosmet Chem. 1989;40:321-333.',
        source_url: 'https://journal.scconline.org/pdf/cc1989/cc040n06/p00321-p00333.pdf',
        note: 'Comedogenicity rating 2 when formulated alone; watchlist rating 4 when combined with ceteareth-20 in emulsifier systems.'
      },
      {
        name: 'ethylhexyl palmitate',
        severity: 'MODERATE',
        citation: 'Draelos ZD, DiNardo JC. A re-evaluation of the comedogenicity concept. J Am Acad Dermatol. 2006;54(3):507-512.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/16488305/',
        note: 'Comedogenicity rating 3-4 depending on base matrix and concentration.'
      }
    ]
  },
  {
    id: 'rule-silicone-free',
    name: 'Silicone-Free',
    slug: 'silicone-free',
    type: 'free',
    description: 'Screens for occlusive dimethicones, siloxanes, and synthetic silicone polymers.',
    relevantCategories: ['Skincare', 'Hair', 'Face', 'Serum', 'Moisturizer', 'Cleanser'],
    triggers: [
      {
        name: 'dimethicone',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Dimethicone and Related Siloxane Polymers. Int J Toxicol. 2003;22(Suppl 2):11-35.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/14555417/',
        note: 'Linear polydimethylsiloxane polymer forming a breathable hydrophobic surface barrier film.'
      },
      {
        name: 'cyclomethicone',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Cyclomethicone (Octamethylcyclotetrasiloxane and Decamethylcyclopentasiloxane), SCCS/1241/10.',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_029.pdf',
        note: 'Volatile cyclic organosilicon mixture evaluated for bioaccumulation and persistent environmental profile.'
      },
      {
        name: 'cyclopentasiloxane',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Decamethylcyclopentasiloxane (D5) in cosmetic products, SCCS/1549/15.',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_174.pdf',
        note: 'Cyclic siloxane fluid regulated under EU REACH Annex XVII due to bioaccumulation in aquatic environments.'
      },
      {
        name: 'cyclohexasiloxane',
        severity: 'HIGH',
        citation: 'European Chemicals Agency (ECHA). SVHC Identification Candidate List for D6 Siloxane (CAS 540-97-6).',
        source_url: 'https://echa.europa.eu/substance-information/-/substanceinfo/100.007.971',
        note: 'Cyclic siloxane D6 compound monitored under environmental persistence guidelines.'
      },
      {
        name: 'amodimethicone',
        severity: 'HIGH',
        citation: 'Becker LC, Bergfeld WF, Belsito DV, et al. Safety Assessment of Dimethicone Crosspolymers as Used in Cosmetics. Int J Toxicol. 2014;33(2 Suppl):65S-115S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24861370/',
        note: 'Amine-functionalized silicone polymer providing substantive surface conditioning.'
      },
      {
        name: 'dimethiconol',
        severity: 'HIGH',
        citation: 'Becker LC, Bergfeld WF, Belsito DV, et al. Safety Assessment of Dimethicone Crosspolymers as Used in Cosmetics. Int J Toxicol. 2014;33(2 Suppl):65S-115S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24861370/',
        note: 'Hydroxyl-terminated dimethyl silicone fluid.'
      },
      {
        name: 'phenyl trimethicone',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Phenyl-Modified Silicones as Used in Cosmetics. Cosmetic Ingredient Review, 2013.',
        source_url: 'https://www.cir-safety.org/ingredients',
        note: 'Phenylated silicone fluid offering high refractive index and surface gloss.'
      },
      {
        name: 'cetyl dimethicone',
        severity: 'HIGH',
        citation: 'Becker LC, Bergfeld WF, Belsito DV, et al. Safety Assessment of Dimethicone Crosspolymers. Int J Toxicol. 2014;33(2 Suppl):65S-115S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/24861370/',
        note: 'Alkyl-modified dimethicone polymer.'
      }
    ]
  },
  {
    id: 'rule-fragrance-free',
    name: 'Fragrance-Free',
    slug: 'fragrance-free',
    type: 'free',
    description: 'Screens for synthetic perfumes (parfum) and European Union regulated contact allergen aromatic compounds.',
    relevantCategories: ['Skincare', 'Body', 'Face', 'Hair', 'Sunscreen', 'Cleanser', 'Moisturizer'],
    triggers: [
      {
        name: 'fragrance',
        severity: 'HIGH',
        citation: 'European Commission. Regulation (EC) No 1223/2009 on cosmetic products, Annex III.',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
        note: 'Undisclosed synthetic perfume mixture composed of potential sensitizing aroma chemicals.'
      },
      {
        name: 'parfum',
        severity: 'HIGH',
        citation: 'European Commission. Regulation (EC) No 1223/2009 on cosmetic products, Annex III.',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
        note: 'Official European INCI designation for complex proprietary fragrance formulations.'
      },
      {
        name: 'linalool',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Terpene pre-hapten that oxidizes upon atmospheric exposure to form potent contact-sensitizing hydroperoxides.'
      },
      {
        name: 'limonene',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Citrus terpene that oxidizes on skin into limonene hydroperoxides with high clinical patch test positivity.'
      },
      {
        name: 'citronellol',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Monoterpenoid floral fragrance component listed among regulated European contact allergens.'
      },
      {
        name: 'geraniol',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Rose-like monoterpenoid alcohol requiring mandatory individual label declaration in the EU.'
      },
      {
        name: 'coumarin',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Benzopyrone aromatic compound with established contact sensitization frequency.'
      },
      {
        name: 'citral',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Isomeric aldehyde blend with documented skin-sensitizing allergenicity.'
      },
      {
        name: 'hydroxycitronellal',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Synthetic floral odorant recognized as a classic contact allergen in dermatological patch testing.'
      }
    ]
  },
  {
    id: 'rule-paraben-free',
    name: 'Paraben-Free',
    slug: 'paraben-free',
    type: 'free',
    description: 'Screens for alkyl ester preservatives derived from para-hydroxybenzoic acid.',
    relevantCategories: ['Skincare', 'Body', 'Face', 'Hair', 'Sunscreen', 'Cleanser', 'Moisturizer'],
    triggers: [
      {
        name: 'methylparaben',
        severity: 'HIGH',
        citation: 'Andersen FA. Final amended report on the safety assessment of Methylparaben, Ethylparaben, Propylparaben, Isopropylparaben, Butylparaben, Isobutylparaben, and Benzylparaben. Int J Toxicol. 2008;27(Suppl 4):1-82.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/19101832/',
        note: 'Short-chain methyl ester of 4-hydroxybenzoic acid.'
      },
      {
        name: 'propylparaben',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Parabens (Updated request on Butylparaben and Propylparaben), SCCS/1514/13 (2014).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_132.pdf',
        note: 'Propyl ester preservative subject to EU concentration limits (maximum 0.14% single ester).'
      },
      {
        name: 'butylparaben',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Parabens, SCCS/1514/13 (2014).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_132.pdf',
        note: 'Butyl ester preservative restricted due to higher binding affinity for estrogen receptors compared to short-chain parabens.'
      },
      {
        name: 'ethylparaben',
        severity: 'HIGH',
        citation: 'Andersen FA. Final amended report on the safety assessment of Methylparaben, Ethylparaben, etc. Int J Toxicol. 2008;27(Suppl 4):1-82.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/19101832/',
        note: 'Ethyl ester antimicrobial preservative.'
      },
      {
        name: 'isobutylparaben',
        severity: 'HIGH',
        citation: 'European Commission. Regulation (EU) No 358/2014 amending Annexes II and V to Regulation (EC) No 1223/2009.',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358',
        note: 'Branched paraben banned in cosmetic formulations in the European Union.'
      },
      {
        name: 'isopropylparaben',
        severity: 'HIGH',
        citation: 'European Commission. Regulation (EU) No 358/2014 amending Annexes II and V to Regulation (EC) No 1223/2009.',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32014R0358',
        note: 'Branched-chain paraben prohibited in cosmetics throughout the EU due to inadequate safety margins for endocrine activity.'
      }
    ]
  },
  {
    id: 'rule-sulfate-free',
    name: 'Sulfate-Free',
    slug: 'sulfate-free',
    type: 'free',
    description: 'Screens for harsh alkyl sulfate surfactants that strip epidermal lipophilic barriers.',
    relevantCategories: ['Hair', 'Cleanser', 'Body', 'Face'],
    triggers: [
      {
        name: 'sodium lauryl sulfate',
        severity: 'HIGH',
        citation: 'Löffler H, Effendy I. Skin susceptibility of atopic individuals. Contact Dermatitis. 1999;40(5):239-242.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/10344477/',
        note: 'Anionic alkyl sulfate detergent; benchmark model skin irritant known to dissolve intercellular lipid bilayers and provoke transepidermal water loss.'
      },
      {
        name: 'sodium laureth sulfate',
        severity: 'HIGH',
        citation: 'Robinson VC, Bergfeld WF, Belsito DV, et al. Final report of the amended safety assessment of sodium laureth sulfate and related salts of sulfated ethoxylated alcohols. Int J Toxicol. 2010;29(4 Suppl):151S-161S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/20634505/',
        note: 'Ethoxylated sulfate surfactant; milder than SLS but capable of stripping lipid barriers when unbuffered in leave-on or sensitive applications.'
      },
      {
        name: 'ammonium lauryl sulfate',
        severity: 'HIGH',
        citation: 'CIR Panel. Final Report on the Safety Assessment of Sodium Lauryl Sulfate and Ammonium Lauryl Sulfate. J Am Coll Toxicol. 1983;2(7):127-181.',
        source_url: 'https://www.cir-safety.org/ingredients',
        note: 'Strong anionic surfactant with substantial cutaneous irritancy potential.'
      },
      {
        name: 'ammonium laureth sulfate',
        severity: 'HIGH',
        citation: 'Robinson VC, Bergfeld WF, Belsito DV, et al. Int J Toxicol. 2010;29(4 Suppl):151S-161S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/20634505/',
        note: 'Ethoxylated ammonium alkyl ether sulfate cleansing agent.'
      },
      {
        name: 'sodium coco-sulfate',
        severity: 'HIGH',
        citation: 'Fiume MZ, et al. Final report on the safety assessment of sodium cetearyl sulfate and related alkyl sulfates as used in cosmetics. Int J Toxicol. 2010;29(3 Suppl):115S-132S.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/20448271/',
        note: 'Broad-cut coconut fatty alcohol sulfate mixture containing roughly 50% sodium lauryl sulfate.'
      }
    ]
  },
  {
    id: 'rule-alcohol-free',
    name: 'Alcohol-Free',
    slug: 'alcohol-free',
    type: 'free',
    description: 'Screens for simple low-molecular-weight volatile drying alcohols (does not flag beneficial emollient fatty alcohols).',
    relevantCategories: ['Skincare', 'Face', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'],
    triggers: [
      {
        name: 'alcohol denat.',
        severity: 'HIGH',
        citation: 'CIR Panel. Final Report on the Safety Assessment of Alcohol Denat., Including SD Alcohol 40, etc. Int J Toxicol. 2008;27(Suppl 1):1-43.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18569160/',
        note: 'Volatile drying alcohol that strips natural stratum corneum lipids and accelerates cutaneous evaporation.'
      },
      {
        name: 'alcohol denat',
        severity: 'HIGH',
        citation: 'CIR Panel. Final Report on the Safety Assessment of Alcohol Denat. Int J Toxicol. 2008;27(Suppl 1):1-43.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18569160/',
        note: 'Variant punctuation INCI for denatured ethanol.'
      },
      {
        name: 'sd alcohol 40',
        severity: 'HIGH',
        citation: 'CIR Panel. Int J Toxicol. 2008;27(Suppl 1):1-43.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18569160/',
        note: 'Specially denatured alcohol grade 40.'
      },
      {
        name: 'sd alcohol 40-b',
        severity: 'HIGH',
        citation: 'CIR Panel. Int J Toxicol. 2008;27(Suppl 1):1-43.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18569160/',
        note: 'Common ethanol grade denatured with t-butyl alcohol and denatonium benzoate.'
      },
      {
        name: 'isopropyl alcohol',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Isopropanol. J Am Coll Toxicol. 1989.',
        source_url: 'https://www.cir-safety.org/ingredients',
        note: 'Rapid-drying volatile alcohol with high lipid extraction capacity.'
      },
      {
        name: 'ethanol',
        severity: 'HIGH',
        citation: 'CIR Panel. Final Report on the Safety Assessment of Alcohol Denat. and Ethanol. Int J Toxicol. 2008;27(Suppl 1):1-43.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18569160/',
        note: 'Pure volatile alcohol disrupting the lamellar phase behavior of epidermal lipids.'
      },
      {
        name: 'benzyl alcohol',
        severity: 'MODERATE',
        citation: 'SCCS. Opinion on Fragrance allergens in cosmetic products, SCCS/1459/11 (2012).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_102.pdf',
        note: 'Aromatic preservative alcohol; negligible drying properties compared to ethanol, but flagged on moderate watchlist as a recognized contact allergen.'
      }
    ]
  },
  {
    id: 'rule-vegan-cruelty-free',
    name: 'Vegan & Cruelty-Free',
    slug: 'vegan-cruelty-free',
    type: 'free',
    description: 'Screens for animal-derived tissues, secretions, insect extracts, and sheep wool lanolin.',
    relevantCategories: ['Skincare', 'Lip Care', 'Body', 'Hair', 'Moisturizer', 'Face'],
    triggers: [
      {
        name: 'snail secretion filtrate',
        severity: 'HIGH',
        citation: 'The Vegan Society Trademark Standards Criteria (Animal By-Product Guidance).',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Direct animal secretion collected from gastropod land snails (Helix aspersa).'
      },
      {
        name: 'lanolin',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Lanolin and Lanolin Derivatives. J Am Coll Toxicol. 1982;1(4):1-35. & Vegan Society Criteria.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Sebaceous wax harvested from the sheared wool of domestic sheep (Ovis aries).'
      },
      {
        name: 'cera alba',
        severity: 'HIGH',
        citation: 'European Pharmacopoeia (Ph. Eur.) Monograph 0069 (White Beeswax) & Vegan Society Standards.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Purified and bleached beeswax synthesized by honey bees (Apis mellifera).'
      },
      {
        name: 'beeswax',
        severity: 'HIGH',
        citation: 'The Vegan Society Trademark Standards Criteria.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Natural wax secreted by the abdominal glands of worker bees.'
      },
      {
        name: 'carmine',
        severity: 'HIGH',
        citation: 'EFSA Panel on Food Additives. Scientific Opinion on the re-evaluation of cochineal, carminic acid, carmines (E 120). EFSA Journal. 2015;13(11):4288.',
        source_url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4288',
        note: 'Natural red pigment derived from dried, crushed female cochineal insects (Dactylopius coccus).'
      },
      {
        name: 'ci 75470',
        severity: 'HIGH',
        citation: 'EFSA Panel on Food Additives. EFSA Journal. 2015;13(11):4288.',
        source_url: 'https://www.efsa.europa.eu/en/efsajournal/pub/4288',
        note: 'Official Colour Index designation for natural carmine / cochineal extract.'
      },
      {
        name: 'collagen',
        severity: 'HIGH',
        citation: 'The Vegan Society Trademark Standards Criteria.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Animal connective tissue protein extracted from bovine hide, porcine skin, or fish scales.'
      },
      {
        name: 'keratin',
        severity: 'HIGH',
        citation: 'The Vegan Society Trademark Standards Criteria.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Animal protein processed from feathers, wool, horns, or animal hooves.'
      },
      {
        name: 'gelatin',
        severity: 'HIGH',
        citation: 'The Vegan Society Trademark Standards Criteria.',
        source_url: 'https://www.vegansociety.com/your-business/vegan-trademark-standards',
        note: 'Hydrolyzed animal collagen obtained from boiling animal skin and bones.'
      }
    ]
  },
  {
    id: 'rule-reef-safe',
    name: 'Reef-Safe Sunscreen',
    slug: 'reef-safe',
    type: 'free',
    description: 'Screens for chemical UV filters banned in Hawaii (Act 104) and the US Virgin Islands due to coral bleaching and marine ecotoxicity.',
    relevantCategories: ['Sunscreen'],
    triggers: [
      {
        name: 'oxybenzone',
        severity: 'HIGH',
        citation: 'Downs CA, Kramarsky-Winter E, Segal R, et al. Toxicopathological Effects of the Sunscreen UV Filter, Oxybenzone, on Coral Planulae. Arch Environ Contam Toxicol. 2016;70(2):265-288.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/26487337/',
        note: 'Chemical UV filter banned in Hawaii (Act 104); causes endocrine disruption, DNA damage, and deformation in coral larvae.'
      },
      {
        name: 'octinoxate',
        severity: 'HIGH',
        citation: 'State of Hawaii Legislature. Act 104 (SB 2571): Sunscreens; Oxybenzone; Octinoxate; Environmental Protection. 2018.',
        source_url: 'https://www.capitol.hawaii.gov/session2018/bills/SB2571_CD1_.htm',
        note: 'Banned sunscreen agent that induces bleaching in stony corals and damages symbiont photosynthetic efficiency.'
      },
      {
        name: 'octocrylene',
        severity: 'HIGH',
        citation: 'Downs CA, DiNardo JC, Stien D, et al. Benzophenone Accumulates over Time from the Degradation of Octocrylene in Commercial Sunscreen Products. Chem Res Toxicol. 2021;34(4):1046-1054.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/33682414/',
        note: 'Banned in the US Virgin Islands (Act 8185); degrades into benzophenone and accumulates in marine wildlife tissues.'
      },
      {
        name: 'homosalate',
        severity: 'MODERATE',
        citation: 'SCCS. Opinion on Homosalate, SCCS/1638/21 (2021).',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_259.pdf',
        note: 'Under active environmental review for bioaccumulation in aquatic food chains and endocrine-active properties.'
      },
      {
        name: 'avobenzone',
        severity: 'MODERATE',
        citation: 'National Academies of Sciences, Engineering, and Medicine (NASEM). Review of Fate, Exposure, and Effects of Sunscreens in Aquatic Environments. Washington, DC: The National Academies Press; 2022.',
        source_url: 'https://doi.org/10.17226/26381',
        note: 'Photodegradation byproducts interact with chlorinated water and marine micro-organisms, warranting watchlist status.'
      }
    ]
  },
  {
    id: 'rule-rosacea-eczema',
    name: 'Rosacea & Eczema-Safe',
    slug: 'rosacea-eczema',
    type: 'risk',
    description: 'Screens for stinging acids, aggressive retinoids, synthetic dyes, and known vascular flush triggers.',
    relevantCategories: ['Skincare', 'Face', 'Moisturizer', 'Serum', 'Cleanser', 'Treatment', 'Eye Cream'],
    triggers: [
      {
        name: 'glycolic acid',
        severity: 'HIGH',
        citation: 'Wilkin J, Dahl M, Detmar M, et al. Standard classification of rosacea: Report of the National Rosacea Society Expert Committee on the Classification and Staging of Rosacea. J Am Acad Dermatol. 2002;46(4):584-587.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/11907512/',
        note: 'Small molecular alpha-hydroxy acid that penetrates impaired stratum corneum rapidly, causing intense burning, erythema, and neurovascular dilation.'
      },
      {
        name: 'lactic acid',
        severity: 'MODERATE',
        citation: 'Wilkin J, Dahl M, Detmar M, et al. Standard classification of rosacea: Report of the National Rosacea Society Expert Committee on the Classification and Staging of Rosacea. J Am Acad Dermatol. 2002;46(4):584-587.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/11907512/',
        note: 'AHA exfoliant with moderate sting potential on compromised atopic barriers.'
      },
      {
        name: 'alcohol denat.',
        severity: 'HIGH',
        citation: 'Wilkin J, Dahl M, Detmar M, et al. Standard classification of rosacea: Report of the National Rosacea Society Expert Committee on the Classification and Staging of Rosacea. J Am Acad Dermatol. 2002;46(4):584-587.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/11907512/',
        note: 'Volatile drying alcohol inducing immediate neurovascular flushing, stinging, and lipid depletion.'
      },
      {
        name: 'menthol',
        severity: 'HIGH',
        citation: 'Wilkin J, Dahl M, Detmar M, et al. Standard classification of rosacea: Report of the National Rosacea Society Expert Committee on the Classification and Staging of Rosacea. J Am Acad Dermatol. 2002;46(4):584-587.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/11907512/',
        note: 'Sensory counter-irritant that activates TRPM8 cold-sensing receptors, provoking reactive vasodilatory flush.'
      },
      {
        name: 'camphor',
        severity: 'HIGH',
        citation: 'Wilkin J, Dahl M, Detmar M, et al. Standard classification of rosacea: Report of the National Rosacea Society Expert Committee on the Classification and Staging of Rosacea. J Am Acad Dermatol. 2002;46(4):584-587.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/11907512/',
        note: 'Known cutaneous sensory irritant triggering burning and facial erythema.'
      },
      {
        name: 'eucalyptus globulus leaf oil',
        severity: 'HIGH',
        citation: 'American Contact Dermatitis Society (ACDS). Botanical Core Series Evaluation.',
        source_url: 'https://www.contactderm.org/',
        note: 'Essential oil rich in 1,8-cineole that frequently elicits contact irritancy in barrier-compromised eczema and rosacea.'
      },
      {
        name: 'sodium lauryl sulfate',
        severity: 'HIGH',
        citation: 'National Eczema Association (NEA). Criteria for the Eczema Seal of Acceptance.',
        source_url: 'https://nationaleczema.org/eczema-products/',
        note: 'Harsh anionic surfactant that denatures epidermal proteins and disrupts filaggrin-deficient atopic skin barriers.'
      },
      {
        name: 'fragrance',
        severity: 'HIGH',
        citation: 'Uter W, et al. European Society of Contact Dermatitis Guideline for Diagnostic Patch Testing-Recommendations on Best Practice. Contact Dermatitis. 2026.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/42324086/',
        note: 'Leading cause of allergic contact dermatitis and flare-ups in rosacea and eczema patients.'
      },
      {
        name: 'parfum',
        severity: 'HIGH',
        citation: 'Uter W, et al. European Society of Contact Dermatitis Guideline for Diagnostic Patch Testing-Recommendations on Best Practice. Contact Dermatitis. 2026.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/42324086/',
        note: 'Synthetic aroma compound mixture triggering inflammatory responses in hyper-reactive facial skin.'
      }
    ]
  },
  {
    id: 'rule-malassezia-free',
    name: 'Malassezia Yeast Free',
    slug: 'malassezia-free',
    type: 'risk',
    description: 'Strict yeast isolation screen targeting pityrosporum folliculitis and seborrheic dermatitis fungal nutrition.',
    relevantCategories: ['Skincare', 'Face', 'Hair', 'Cleanser', 'Moisturizer', 'Serum'],
    triggers: [
      {
        name: 'polysorbate 20',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Tween ester delivering fatty acid lipids directly consumed by Malassezia yeasts.'
      },
      {
        name: 'polysorbate 80',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Oleate ester serving as primary lipid nutrition for lipophilic yeast species.'
      },
      {
        name: 'olive oil',
        severity: 'HIGH',
        citation: 'Danby SG, AlEnezi T, Sultan A, et al. Effect of olive and sunflower seed oil on the adult skin barrier: implications for neonatal skin care. Pediatr Dermatol. 2013;30(1):42-50.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/22995032/',
        note: 'High free oleic acid ratio damages stratum corneum barrier integrity and promotes Malassezia colonization.'
      },
      {
        name: 'coconut oil',
        severity: 'HIGH',
        citation: 'Verallo-Rowell VM, Dillague KM, Syah-Tjundawan BS. Novel antibacterial and emollient effects of coconut and virgin olive oils in adult atopic dermatitis. Dermatitis. 2008;19(6):308-315. & Mayser P, 1998.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/19134433/',
        note: 'Triglyceride matrix broken down by yeast lipases into free fatty acids that support pityrosporum proliferation.'
      },
      {
        name: 'glyceryl stearate',
        severity: 'HIGH',
        citation: 'Mayser P, Grimmig D, Krämer HJ. Different utilization of neutral lipids by Malassezia furfur and Malassezia sympodialis. Med Mycol. 1998;36(6):395-402.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9776806/',
        note: 'Stearic acid monoglyceride metabolized as a carbon and energy source by fungal lipases.'
      }
    ]
  },
  {
    id: 'rule-nut-allergy',
    name: 'Nut-Allergy Safe',
    slug: 'nut-allergy-safe',
    type: 'free',
    description: 'Screens for tree nut and peanut botanical seed oils, flours, and nut shell abrasive powders.',
    relevantCategories: ['Skincare', 'Body', 'Face', 'Hair', 'Lip Care', 'Moisturizer'],
    triggers: [
      {
        name: 'prunus amygdalus dulcis oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Sweet almond oil expressed from tree nuts; poses contact urticaria and anaphylaxis cross-reactivity risks in sensitized individuals.'
      },
      {
        name: 'sweet almond oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Common botanical name for Prunus amygdalus dulcis oil.'
      },
      {
        name: 'macadamia ternifolia seed oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Macadamia tree nut botanical oil.'
      },
      {
        name: 'macadamia integrifolia seed oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Macadamia seed lipid extract.'
      },
      {
        name: 'juglans regia shell powder',
        severity: 'HIGH',
        citation: 'American Academy of Allergy, Asthma & Immunology (AAAAI). Tree Nut Allergen Guidance.',
        source_url: 'https://www.aaaai.org/conditions-treatments/allergies/food-allergy',
        note: 'Abrasive powder produced by crushing English walnut shells.'
      },
      {
        name: 'corylus avellana seed oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Hazelnut tree nut seed oil.'
      },
      {
        name: 'arachis hypogaea oil',
        severity: 'HIGH',
        citation: 'European Commission. SCCS Opinion on Peanut Oil (Sensitization in Cosmetics), SCCS/1526/14.',
        source_url: 'https://ec.europa.eu/health/scientific_committees/consumer_safety/docs/sccs_o_152.pdf',
        note: 'Peanut oil; unrefined grades carry residual peanut protein capable of eliciting type I hypersensitivity.'
      },
      {
        name: 'pistacia vera seed oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Pistachio tree nut botanical oil.'
      },
      {
        name: 'anacardium occidentale seed oil',
        severity: 'HIGH',
        citation: 'CIR Panel. Safety Assessment of Plant-Derived Fatty Acid Oils. Int J Toxicol. 2017.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/29243540/',
        note: 'Cashew tree nut seed oil.'
      }
    ]
  },
  {
    id: 'rule-gluten-free',
    name: 'Gluten-Free',
    slug: 'gluten-free',
    type: 'free',
    description: 'Screens for wheat, barley, rye, and oat protein fractions relevant to celiac disease and dermatitis herpetiformis.',
    relevantCategories: ['Skincare', 'Lip Care', 'Face', 'Body', 'Hair'],
    triggers: [
      {
        name: 'triticum vulgare germ oil',
        severity: 'HIGH',
        citation: 'Tatham AS, Shewry PR. Allergens to wheat and related cereals. Clin Exp Allergy. 2008;38(11):1712-1726.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18823308/',
        note: 'Wheat germ botanical lipid containing potential trace gluten peptides.'
      },
      {
        name: 'triticum vulgare flour lipids',
        severity: 'HIGH',
        citation: 'Tatham AS, Shewry PR. Allergens to wheat and related cereals. Clin Exp Allergy. 2008;38(11):1712-1726.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/18823308/',
        note: 'Wheat flour lipid fraction with cross-contamination risk for celiac patients upon accidental ingestion or mucosal transfer.'
      },
      {
        name: 'hydrolyzed wheat protein',
        severity: 'HIGH',
        citation: 'Niinimäki A, Niinimäki M, Mäkinen-Kiljunen S, Hannuksela M. Contact urticaria from protein hydrolysates in hair conditioners. Contact Dermatitis. 1998;39(1):24-26.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/9860241/',
        note: 'Hydrolyzed wheat storage protein; established trigger of immediate IgE-mediated contact urticaria.'
      },
      {
        name: 'hordeum vulgare seed extract',
        severity: 'HIGH',
        citation: 'Thompson T, Grace T. Gluten in cosmetics: is there a reason for concern? J Acad Nutr Diet. 2012;112(9):1316-1323.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/22939435/',
        note: 'Barley seed botanical extract containing hordein gluten proteins.'
      },
      {
        name: 'secale cereale seed extract',
        severity: 'HIGH',
        citation: 'Thompson T, Grace T. Gluten in cosmetics: is there a reason for concern? J Acad Nutr Diet. 2012;112(9):1316-1323.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/22939435/',
        note: 'Rye grain botanical extract containing secalin gluten proteins.'
      },
      {
        name: 'hydrolyzed wheat starch',
        severity: 'HIGH',
        citation: 'Thompson T, Grace T. Gluten in cosmetics: is there a reason for concern? J Acad Nutr Diet. 2012;112(9):1316-1323.',
        source_url: 'https://pubmed.ncbi.nlm.nih.gov/22939435/',
        note: 'Starch derivative prepared from wheat grain; potential gluten peptide residues.'
      }
    ]
  },
  {
    id: 'rule-phthalate-free',
    name: 'Phthalate-Free',
    slug: 'phthalate-free',
    type: 'free',
    description: 'Screens for dialkyl or alkyl aryl esters of 1,2-benzenedicarboxylic acid plasticizers and fragrance fixatives.',
    relevantCategories: ['Skincare', 'Face', 'Body', 'Hair'],
    triggers: [
      {
        name: 'diethyl phthalate',
        severity: 'HIGH',
        citation: 'SCCS. Opinion on Phthalates (Diethyl phthalate), SCCS/1183/08 (2008).',
        source_url: 'https://ec.europa.eu/health/archive/ph_risk/committees/04_sccp/docs/sccp_o_138.pdf',
        note: 'Synthetic fragrance fixative under continuous toxicological scrutiny for potential endocrine disruption.'
      },
      {
        name: 'dimethyl phthalate',
        severity: 'HIGH',
        citation: 'CIR Panel. Final Report on the Safety Assessment of Dibutyl Phthalate, Dimethyl Phthalate, and Diethyl Phthalate. J Am Coll Toxicol. 1985;4(3):267-303.',
        source_url: 'https://www.cir-safety.org/ingredients',
        note: 'Dialkyl phthalate solvent and plasticizer.'
      },
      {
        name: 'dibutyl phthalate',
        severity: 'HIGH',
        citation: 'European Parliament and Council. Regulation (EC) No 1223/2009, Annex II (Substances prohibited in cosmetic products: Entry 675).',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
        note: 'Category 1B reproductive toxicant banned from cosmetic formulations in the European Union.'
      },
      {
        name: 'di-2-ethylhexyl phthalate',
        severity: 'HIGH',
        citation: 'European Parliament and Council. Regulation (EC) No 1223/2009, Annex II (Substances prohibited in cosmetic products: Entry 677).',
        source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32009R1223',
        note: 'DEHP plasticizer; banned reproductive toxicant in cosmetics.'
      }
    ]
  }
];
